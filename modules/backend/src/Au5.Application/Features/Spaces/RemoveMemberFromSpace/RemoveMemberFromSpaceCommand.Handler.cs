using Au5.Application.Common;
using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.RemoveMemberFromSpace;

public class RemoveMemberFromSpaceCommandHandler : IRequestHandler<RemoveMemberFromSpaceCommand, Result<RemoveMemberFromSpaceResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public RemoveMemberFromSpaceCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
		_currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
	}

	public async ValueTask<Result<RemoveMemberFromSpaceResponse>> Handle(RemoveMemberFromSpaceCommand request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;

		var spaceData = await _dbContext.Set<Space>()
						.Where(s => s.Id == request.SpaceId && s.IsActive)
						.Select(s => new
						{
							Members = s.UserSpaces
								.Where(us => us.User.IsActive)
								.Select(us => new SpaceUserInfo
								{
									UserId = us.UserId,
									IsAdmin = us.IsAdmin
								})
								  .ToArray()
						})
						.AsNoTracking()
						.FirstOrDefaultAsync(cancellationToken);

		if (spaceData is null)
		{
			return Error.NotFound("Space.NotFound", "The requested space does not exist or is inactive.");
		}

		var requestUserMembership = spaceData.Members
			.FirstOrDefault(us => us.UserId == request.MemberUserId);

		if (requestUserMembership is null)
		{
			return Error.NotFound("UserSpace.NotFound", "The requested membership was not found.");
		}

		var currentUserMembership = spaceData.Members
			.FirstOrDefault(us => us.UserId == currentUserId);

		var isAdmin = _currentUserService.Role == RoleTypes.Admin || currentUserMembership?.IsAdmin == true;

		if (!isAdmin)
		{
			return Error.Forbidden("Space.Access.Denied", "You do not have access to this space.");
		}

		var userSpace = await _dbContext.Set<UserSpace>()
			.FirstOrDefaultAsync(us => us.SpaceId == request.SpaceId && us.UserId == request.MemberUserId, cancellationToken);

		_dbContext.Set<UserSpace>().Remove(userSpace);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return new RemoveMemberFromSpaceResponse(true, AppResources.Space.RemovedSuccessfully);
	}
}
