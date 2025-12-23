namespace Au5.Application.Features.Spaces.RemoveUserFromSpace;

public record RemoveUserFromSpaceCommand : IRequest<Result>
{
	public Guid SpaceId { get; init; }

	public Guid UserId { get; init; }
}
