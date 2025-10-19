namespace Au5.Application.Features.MeetingSpaces.AddMeetingToSpace;

public record AddMeetingToSpaceCommand(Guid MeetingId, Guid SpaceId) : IRequest<Result<AddMeetingToSpaceResponse>>;