namespace Au5.Application.Features.Meetings.ExportToText;

public record ExportToTextQuery(Guid MeetingId, string MeetId) : IRequest<Result<string>>;
