using Au5.Application.Dtos.Spaces;

namespace Au5.Application.Features.Spaces.GetSpaceMembers;

public record GetSpaceMembersQuery(Guid SpaceId) : IRequest<Result<GetSpaceMembersResponse>>;

public record GetSpaceMembersResponse
{
	public List<SpaceUserInfo> Users { get; init; }
}
