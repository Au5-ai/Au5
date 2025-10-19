namespace Au5.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;

public record RemoveMeetingFromSpaceCommand(Guid MeetingId, Guid SpaceId) : IRequest<Result<RemoveMeetingFromSpaceResponse>>;