using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.GetSpaceMembers;

public record SpaceMemebersQuery(Guid SpaceId) : IRequest<Result<SpaceMembersResponse>>;

public record SpaceMembersResponse
{
	public IReadOnlyCollection<SpaceUserInfo> Users { get; init; }
}
