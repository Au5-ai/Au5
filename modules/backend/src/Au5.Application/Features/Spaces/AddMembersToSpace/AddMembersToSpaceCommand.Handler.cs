using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.AddMembersToSpace;

public class AddMembersToSpaceCommandHandler : IRequestHandler<AddMembersToSpaceCommand, Result>
{
	private readonly IApplicationDbContext _context;
	private readonly IDataProvider _dataProvider;
	private readonly ICurrentUserService _currentUserService;

	public AddMembersToSpaceCommandHandler(
		IApplicationDbContext context,
		IDataProvider dataProvider,
		ICurrentUserService currentUserService)
	{
		_context = context;
		_dataProvider = dataProvider;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result> Handle(AddMembersToSpaceCommand request, CancellationToken cancellationToken)
	{
		var currentUserId = _currentUserService.UserId;
		var organizationId = _currentUserService.OrganizationId;

		if (request.Users == null || request.Users.Count == 0)
		{
			return Error.Validation("Space.NoUsers", AppResources.Space.NoUsersMessage);
		}

		var space = await _context.Set<Space>()
			.Include(s => s.UserSpaces)
			.FirstOrDefaultAsync(s => s.Id == request.SpaceId && s.OrganizationId == organizationId && s.IsActive, cancellationToken);

		if (space == null)
		{
			return Error.NotFound("Space.NotFound", AppResources.Space.NotFoundMessage);
		}

		var currentUserSpace = space.UserSpaces.FirstOrDefault(us => us.UserId == currentUserId);
		if (currentUserSpace == null || !currentUserSpace.IsAdmin)
		{
			if (_currentUserService.Role != RoleTypes.Admin)
			{
				return Error.Forbidden("Space.NoPermission", AppResources.Space.NoPermissionMessage);
			}
		}

		var userIds = request.Users.Select(u => u.UserId).ToList();
		var existingUsers = await _context.Set<User>()
			.Where(u => userIds.Contains(u.Id) && u.IsActive && u.OrganizationId == organizationId)
			.Select(u => u.Id)
			.ToListAsync(cancellationToken);

		if (existingUsers.Count != userIds.Count)
		{
			return Error.Validation("Space.InvalidUsers", AppResources.Space.InvalidUsersMessage);
		}

		var existingMemberIds = space.UserSpaces.Select(us => us.UserId).ToHashSet();
		var newMembers = request.Users
			.Where(u => !existingMemberIds.Contains(u.UserId))
			.Select(user => new UserSpace
			{
				UserId = user.UserId,
				SpaceId = space.Id,
				JoinedAt = _dataProvider.Now,
				IsAdmin = user.IsAdmin
			})
			.ToList();

		if (newMembers.Count == 0)
		{
			return Error.Validation("Space.AllUsersAlreadyMembers", AppResources.Space.AllUsersAlreadyMembersMessage);
		}

		_context.Set<UserSpace>().AddRange(newMembers);

		var result = await _context.SaveChangesAsync(cancellationToken);

		return result.IsFailure
			? Error.Failure("Space.FailedToAddMembers", AppResources.Space.AddMembersFailedMessage)
			: Result.Success();
	}
}
