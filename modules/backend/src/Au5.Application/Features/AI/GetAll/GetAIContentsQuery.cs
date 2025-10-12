namespace Au5.Application.Features.AI.GetAll;

public record GetAIContentsQuery(Guid MeetingId, string MeetId) : IRequest<Result<IReadOnlyCollection<AIContents>>>;
