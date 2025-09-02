namespace Au5.Application.Features.Meetings.GetFullTranscription;

public record GetFullTranscriptionQuery(Guid MeetingId, string MeetId) : IRequest<Result<FullTranscriptionResponse>>;

public class FullTranscriptionResponse
{
	public Guid Id { get; init; }

	public string Title { get; init; }

	public string MeetingId { get; init; }

	public Participant UserRecorder { get; init; }

	public string Platform { get; init; }

	public string BotName { get; init; }

	public bool IsBotAdded { get; init; }

	public string CreatedAt { get; init; }

	public string Duration { get; init; }

	public string ClosedAt { get; init; }

	public string Status { get; init; }

	public IReadOnlyList<Participant> Participants { get; init; }

	public IReadOnlyList<Participant> Guests { get; init; }

	public IReadOnlyList<EntryDto> Entries { get; init; }
}
