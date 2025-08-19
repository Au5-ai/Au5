namespace Au5.Application.Features.Meetings.UpsertBlock;

public record UpsertBlockCommand(EntryMessage Entry) : IRequest<bool>;
