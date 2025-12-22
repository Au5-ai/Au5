namespace Au5.Application.Features.Spaces.AddMembersToSpace;

public record AddMembersToSpaceCommand : IRequest<Result>
{
	public Guid SpaceId { get; init; }

	public List<UserInSpace> Users { get; init; }
}

public record UserInSpace
{
	public Guid UserId { get; init; }

	public bool IsAdmin { get; init; }
}
