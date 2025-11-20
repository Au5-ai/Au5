namespace Au5.Application.Features.Spaces.CreateSpace;

public record CreateSpaceCommand : IRequest<Result<CreateSpaceResponse>>
{
	public string Name { get; init; }

	public string Description { get; init; }

	public List<UserInSpace> Users { get; init; }
}

public record UserInSpace
{
	public Guid UserId { get; init; }

	public bool IsAdmin { get; init; }
}

public record CreateSpaceResponse
{
	public Guid Id { get; init; }
}
