using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.GetSpaces;

public record SpacesQuery : IRequest<Result<IReadOnlyCollection<SpaceResponse>>>;

public record SpaceResponse
{
	public Guid Id { get; init; }

	public string Name { get; init; }

	public string Description { get; init; }

	public bool IsActive { get; init; }

	public List<SpaceUserInfo> Users { get; init; }
}
