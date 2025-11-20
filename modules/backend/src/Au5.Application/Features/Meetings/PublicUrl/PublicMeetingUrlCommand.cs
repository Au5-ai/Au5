namespace Au5.Application.Features.Meetings.PublicUrl;

public record PublicMeetingUrlCommand(Guid MeetingId, int ExpirationDays) : IRequest<Result<PublicMeetingUrlResponse>>;
public record PublicMeetingUrlResponse(string Link, DateTime ExpiryDate);
