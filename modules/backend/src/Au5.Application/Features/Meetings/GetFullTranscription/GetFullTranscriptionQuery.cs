namespace Au5.Application.Features.Meetings.GetFullTranscription;

public record GetFullTranscriptionQuery(string MeetId) : IRequest<Result<FullTranscriptionResponse>>;
