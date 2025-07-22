namespace Au5.Application.Features.Meetings.GetFullTranscription;

public record GetFullTranscriptionQuery(Guid MeetingId, string MeetId) : IRequest<Result<FullTranscriptionResponse>>;
