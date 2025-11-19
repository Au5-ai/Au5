using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandHandler : IRequestHandler<CreateSpaceCommand, Result<CreateSpaceResponse>>
{
	private readonly IApplicationDbContext _context;
	private readonly IDataProvider _dataProvider;
	private readonly ICurrentUserService _currentUserService;

	public CreateSpaceCommandHandler(IApplicationDbContext context, IDataProvider dataProvider, ICurrentUserService currentUserService)
	{
		_context = context;
		_dataProvider = dataProvider;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<CreateSpaceResponse>> Handle(CreateSpaceCommand request, CancellationToken cancellationToken)
	{
		var organizationId = _currentUserService.OrganizationId;

		if (request.Users != null && request.Users.Count != 0)
		{
			var userIds = request.Users.Select(u => u.UserId).ToList();
			var existingUsersCount = await _context.Set<User>()
				.Where(u => userIds.Contains(u.Id) && u.IsActive)
				.CountAsync(cancellationToken);

			if (existingUsersCount != userIds.Count)
			{
				return Error.Validation("Space.InvalidUsers", AppResources.Space.InvalidUsersMessage);
			}
		}

		var space = new Space
		{
			Id = _dataProvider.NewGuid(),
			Name = request.Name,
			Description = request.Description,
			IsActive = true,
			OrganizationId = organizationId
		};

		_context.Set<Space>().Add(space);

		if (request.Users != null && request.Users.Any())
		{
			var userSpaces = request.Users.Select(user => new UserSpace
			{
				UserId = user.UserId,
				SpaceId = space.Id,
				JoinedAt = _dataProvider.UtcNow,
				IsAdmin = user.IsAdmin
			}).ToList();

			_context.Set<UserSpace>().AddRange(userSpaces);
		}

		var result = await _context.SaveChangesAsync(cancellationToken);

		return result.IsFailure
			? Error.Failure("Space.FailedToCreate", AppResources.Space.CreateFailedMessage)
			: new CreateSpaceResponse
			{
				Id = space.Id,
			};
	}
}
