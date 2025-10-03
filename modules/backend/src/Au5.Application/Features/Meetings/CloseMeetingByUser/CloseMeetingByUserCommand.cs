namespace Au5.Application.Features.Meetings.CloseMeetingByUser;

public record CloseMeetingByUserCommand(Guid MeetingId, string MeetId) : IRequest<Result<bool>>;
