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

		if (request.UserIds != null && request.UserIds.Any())
		{
			var existingUsersCount = await _context.Set<User>()
				.Where(u => request.UserIds.Contains(u.Id) && u.IsActive)
				.CountAsync(cancellationToken);

			if (existingUsersCount != request.UserIds.Count)
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

			_context.Set<UserSpace>().AddRange(userSpaces);
		}

		var result = await _context.SaveChangesAsync(cancellationToken);

		if (result.IsFailure)
		{
			return Error.Failure(AppResources.Space.CreateFailedCode, AppResources.Space.CreateFailedMessage);
		}

		return new CreateSpaceResponse
		{
			Id = space.Id,
		};
	}
}
