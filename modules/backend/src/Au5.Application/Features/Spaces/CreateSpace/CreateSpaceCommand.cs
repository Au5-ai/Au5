namespace Au5.Application.Features.Spaces.CreateSpace;

public record CreateSpaceCommand : IRequest<Result<CreateSpaceResponse>>
{
	public string Name { get; init; }

	public string Description { get; init; }

	public Guid? ParentId { get; init; }

	public List<Guid> UserIds { get; init; }
}

public record CreateSpaceResponse
{
	public Guid Id { get; init; }

	public string Name { get; init; }

	public string Description { get; init; }

	public Guid? ParentId { get; init; }

	public DateTime CreatedAt { get; init; }
}
