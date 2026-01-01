namespace Au5.Application.Features.Meetings.UpdateEntry;

public record UpdateEntryBody(string Content);
public record UpdateEntryCommand(Guid MeetingId, int EntryId, string Content) : IRequest<Result<UpdateEntryCommandResponse>>;
public record UpdateEntryCommandResponse();
