namespace Au5.Application.Features.Meetings.GetFullTranscription;

public record GetFullTranscriptionQuery(Guid MeetingId, string MeetId) : IRequest<Result<FullTranscriptionResponse>>;

public record FullTranscriptionResponse(
	Guid Id,
	string MeetingId,
	Participant BotInviterUser,
	string HashToken,
	string Platform,
	string BotName,
	bool IsBotAdded,
	string CreatedAt,
	string Status,
	IReadOnlyList<Participant> Participants,
	IReadOnlyList<EntryDto> Entries
);
