namespace Au5.Application.Features.Meetings.Rename;

public record RenameMeetingCommand(Guid MeetingId, string NewTitle) : IRequest<Result<RenameMeetingCommandResponse>>;
public record RenameMeetingCommandResponse();
