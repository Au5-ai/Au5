namespace Au5.Application.Features.Meetings.GetSystemMeetingUrl;

public record GetMeetingUrlCommand(Guid MeetingId, int ExpirationDays) : IRequest<Result<GetMeetingUrlResponse>>;
public record GetMeetingUrlResponse(string Link, DateTime ExpiryDate);
