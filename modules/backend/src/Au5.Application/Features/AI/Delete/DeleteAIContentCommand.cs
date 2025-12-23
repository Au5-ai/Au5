namespace Au5.Application.Features.AI.Delete;

public record DeleteAIContentCommand(Guid Id, Guid MeetingId) : IRequest<Result<bool>>;
