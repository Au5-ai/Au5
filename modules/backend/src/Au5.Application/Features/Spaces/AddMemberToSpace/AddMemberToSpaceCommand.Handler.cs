using Au5.Application.Common;
using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.AddMemberToSpace;

public class AddMemberToSpaceCommandHandler : IRequestHandler<AddMemberToSpaceCommand, Result<AddMemberToSpaceResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;
	private readonly IDataProvider _dataProvider;

	public AddMemberToSpaceCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService, IDataProvider dataProvider)
	{
		_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
		_currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
		_dataProvider = dataProvider;
	}

	public async ValueTask<Result<AddMemberToSpaceResponse>> Handle(AddMemberToSpaceCommand request, CancellationToken cancellationToken)
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

		var currentUserMembership = spaceData.Members
			.FirstOrDefault(us => us.UserId == currentUserId);

		var isAdmin = _currentUserService.Role == RoleTypes.Admin || currentUserMembership?.IsAdmin == true;

		if (!isAdmin)
		{
			return Error.Forbidden("Space.Access.Denied", "You do not have access to this space.");
		}

		var isOldActiveMember = spaceData.Members?.Any(us => us.UserId == request.NewMemberUserId) ?? false;

		if (isOldActiveMember)
		{
			return Error.BadRequest("User is already a active member.");
		}

		UserSpace newUserSpace = new()
		{
			IsAdmin = request.IsAdmin,
			UserId = request.NewMemberUserId,
			SpaceId = request.SpaceId,
			JoinedAt = _dataProvider.UtcNow
		};

		_dbContext.Set<UserSpace>().AddRange(newUserSpace);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return new AddMemberToSpaceResponse(true, AppResources.Space.AddedSuccessfully);
	}
}
