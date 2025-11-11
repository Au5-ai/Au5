namespace Au5.Application.Features.Spaces.GetUserSpaces;

public record GetUserSpacesQuery : IRequest<Result<IReadOnlyCollection<UserSpaceResponse>>>;

public record UserSpaceResponse
{
	public Guid Id { get; init; }

	public string Name { get; init; }

	public string Description { get; init; }

	public bool IsAdmin { get; init; }
}
