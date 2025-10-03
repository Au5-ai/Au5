using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandHandler : IRequestHandler<CreateSpaceCommand, Result<CreateSpaceResponse>>
{
	private readonly IApplicationDbContext _context;

	public CreateSpaceCommandHandler(IApplicationDbContext context)
	{
		_context = context;
	}

	public async ValueTask<Result<CreateSpaceResponse>> Handle(CreateSpaceCommand request, CancellationToken cancellationToken)
	{
		if (request.ParentId.HasValue)
		{
			var parentExists = await _context.Set<Space>()
				.AnyAsync(s => s.Id == request.ParentId.Value && s.IsActive, cancellationToken);

			if (!parentExists)
			{
				return Error.NotFound(AppResources.Space.ParentNotFoundCode, AppResources.Space.ParentNotFoundMessage);
			}
		}

		if (request.Users != null && request.Users.Any())
		{
			var userIds = request.Users.Select(u => u.UserId).ToList();
			var existingUsersCount = await _context.Set<User>()
				.Where(u => userIds.Contains(u.Id) && u.IsActive)
				.CountAsync(cancellationToken);

			if (existingUsersCount != userIds.Count)
			{
				return Error.Validation(AppResources.Space.InvalidUsersCode, AppResources.Space.InvalidUsersMessage);
			}
		}

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = request.Name,
			Description = request.Description,
			ParentId = request.ParentId,
			IsActive = true
		};

		_context.Set<Space>().Add(space);

		if (request.Users != null && request.Users.Any())
		{
			var userSpaces = request.Users.Select(user => new UserSpace
			{
				UserId = user.UserId,
				SpaceId = space.Id,
				JoinedAt = DateTime.UtcNow,
				IsAdmin = user.IsAdmin
			}).ToList();

			_context.Set<UserSpace>().AddRange(userSpaces);
		}

		var result = await _context.SaveChangesAsync(cancellationToken);

		if (result.IsFailure)
		{
			return Error.Failure(AppResources.Space.CreateFailedCode, AppResources.Space.CreateFailedMessage);
		}

		var createdSpace = await _context.Set<Space>()
			.Include(s => s.Parent)
			.Include(s => s.UserSpaces)
				.ThenInclude(us => us.User)
			.FirstOrDefaultAsync(s => s.Id == space.Id, cancellationToken);

		return createdSpace is null
			? Error.Failure(AppResources.Space.CreateFailedCode, AppResources.Space.CreateFailedMessage)
			: new CreateSpaceResponse
		{
			Id = createdSpace.Id,
			Name = createdSpace.Name,
			Description = createdSpace.Description,
			ParentId = createdSpace.ParentId,
			ParentName = createdSpace.Parent?.Name,
			IsActive = createdSpace.IsActive,
			UsersCount = createdSpace.UserSpaces?.Count ?? 0,
			Users = createdSpace.UserSpaces?.Select(us => new SpaceUserResponse
			{
				UserId = us.UserId,
				FullName = us.User.FullName,
				Email = us.User.Email,
				PictureUrl = us.User.PictureUrl,
				JoinedAt = us.JoinedAt,
				IsAdmin = us.IsAdmin
			}).ToList() ?? []
		};
	}
}
