namespace Au5.Application.Features.Meetings.Export;

public record ExportQuery(Guid MeetingId, string Format) : IRequest<Result<string>>;
