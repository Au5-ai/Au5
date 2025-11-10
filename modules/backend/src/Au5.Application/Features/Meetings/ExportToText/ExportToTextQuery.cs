namespace Au5.Application.Features.Meetings.ExportToText;

public record ExportToTextQuery(Guid MeetingId) : IRequest<Result<string>>;
