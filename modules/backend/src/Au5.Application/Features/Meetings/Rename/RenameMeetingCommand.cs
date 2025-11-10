namespace Au5.Application.Features.Meetings.Rename;

public record RenameMeetingCommand(string MeetingId, string NewTitle) : IRequest<Result<RenameMeetingCommandResponse>>;
public record RenameMeetingCommandResponse();
