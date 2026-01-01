namespace Au5.Application.Features.Meetings.DeleteEntry;

public record DeleteEntryCommand(Guid MeetingId, int EntryId) : IRequest<Result<DeleteEntryCommandResponse>>;
public record DeleteEntryCommandResponse(bool IsDeleted);