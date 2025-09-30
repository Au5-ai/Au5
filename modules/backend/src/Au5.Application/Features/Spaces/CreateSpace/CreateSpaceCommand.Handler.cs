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
				return Error.NotFound("Space.NotFound", "Parent space not found");
			}
		}

		if (request.UserIds != null && request.UserIds.Any())
		{
			var existingUsersCount = await _context.Set<User>()
				.Where(u => request.UserIds.Contains(u.Id) && u.IsActive)
				.CountAsync(cancellationToken);

			if (existingUsersCount != request.UserIds.Count)
			{
				return Error.Validation("Space.InvalidUsers", "One or more users not found");
			}
		}

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = request.Name,
			Description = request.Description,
			ParentId = request.ParentId,
			CreatedAt = DateTime.UtcNow,
			IsActive = true
		};

		_context.Set<Space>().Add(space);

		if (request.UserIds != null && request.UserIds.Any())
		{
			var userSpaces = request.UserIds.Select(userId => new UserSpace
			{
				UserId = userId,
				SpaceId = space.Id,
				JoinedAt = DateTime.UtcNow
			}).ToList();

			foreach (var userSpace in userSpaces)
			{
				_context.Set<UserSpace>().Add(userSpace);
			}
		}

		var result = await _context.SaveChangesAsync(cancellationToken);

		if (!result.IsSuccess)
		{
			return Error.Failure("Space.CreateFailed", "Failed to create space");
		}

		return new CreateSpaceResponse
		{
			Id = space.Id,
			Name = space.Name,
			Description = space.Description,
			ParentId = space.ParentId,
			CreatedAt = space.CreatedAt
		};
	}
}
