namespace Au5.Application.Features.Meetings.Rename;

public record RenameMeetingCommand(string meetingId, string newTitle) : IRequest<Result<RenameMeetingCommandResponse>>;
public record RenameMeetingCommandResponse();
