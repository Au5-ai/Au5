using Au5.Application.Common;

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

		var spaceInfo = await _dbContext.Set<Space>()
						.Where(s => s.Id == request.SpaceId && s.IsActive)
						.Select(s => new
						{
							IsCurrentUserAdmin = s.UserSpaces.Any(us => us.UserId == currentUserId && us.User.IsActive && us.IsAdmin),
							IsNewUserMember = s.UserSpaces.Any(us => us.UserId == request.NewMemberUserId && us.User.IsActive)
						})
						.AsNoTracking()
						.FirstOrDefaultAsync(cancellationToken);

		if (spaceInfo is null)
		{
			return Error.NotFound(AppResources.Space.NotFoundCode, AppResources.Space.NotFoundMessage);
		}

		var isAdmin = _currentUserService.Role == RoleTypes.Admin || spaceInfo.IsCurrentUserAdmin;

		if (!isAdmin)
		{
			return Error.Forbidden(AppResources.Space.SpaceAccessDeniedCode, AppResources.Space.SpaceAccessDeniedMessage);
		}

		if (spaceInfo.IsNewUserMember)
		{
			return Error.BadRequest(AppResources.Space.SpaceUserAlreadyExistCode, AppResources.Space.SpaceUserAlreadyExistMessage);
		}

		UserSpace newUserSpace = new()
		{
			IsAdmin = request.IsAdmin,
			UserId = request.NewMemberUserId,
			SpaceId = request.SpaceId,
			JoinedAt = _dataProvider.UtcNow
		};

		_dbContext.Set<UserSpace>().Add(newUserSpace);
		await _dbContext.SaveChangesAsync(cancellationToken);

		return new AddMemberToSpaceResponse(true, AppResources.Space.AddedSuccessfully);
	}
}
