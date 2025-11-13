using Au5.Application.Common;

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

		var spaceInfo = await _dbContext.Set<Space>()
						.Where(s => s.Id == request.SpaceId && s.IsActive)
						.Select(s => new
						{
							IsCurrentUserAdmin = s.UserSpaces.Any(us => us.UserId == currentUserId && us.User.IsActive && us.IsAdmin),
							IsTargetUserMember = s.UserSpaces.Any(us => us.UserId == request.MemberUserId && us.User.IsActive)
						})
						.AsNoTracking()
						.FirstOrDefaultAsync(cancellationToken);

		if (spaceInfo is null)
		{
			return Error.NotFound(AppResources.Space.NotFoundCode, AppResources.Space.NotFoundMessage);
		}

		if (!spaceInfo.IsTargetUserMember)
		{
			return Error.NotFound(AppResources.Space.InvalidUsersCode, AppResources.Space.InvalidUsersMessage);
		}

		var isAdmin = _currentUserService.Role == RoleTypes.Admin || spaceInfo.IsCurrentUserAdmin;

		if (!isAdmin)
		{
			return Error.Forbidden(AppResources.Space.SpaceAccessDeniedCode, AppResources.Space.SpaceAccessDeniedMessage);
		}

		var userSpace = await _dbContext.Set<UserSpace>()
			.FirstOrDefaultAsync(us => us.SpaceId == request.SpaceId && us.UserId == request.MemberUserId, cancellationToken);

		_dbContext.Set<UserSpace>().Remove(userSpace);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return new RemoveMemberFromSpaceResponse(true, AppResources.Space.RemovedSuccessfully);
	}
}
