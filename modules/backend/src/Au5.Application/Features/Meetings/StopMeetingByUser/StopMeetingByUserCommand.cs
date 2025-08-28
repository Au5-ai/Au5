namespace Au5.Application.Features.Meetings.StopMeetingByUser;

public record StopMeetingByUserCommand(Guid MeetingId, string MeetId) : IRequest<Result<bool>>;
