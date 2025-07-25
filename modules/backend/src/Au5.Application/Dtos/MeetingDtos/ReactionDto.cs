namespace Au5.Application.Dtos.MeetingDtos;

public record ReactionDto(
	int Id,
	string Type,
	string Emoji,
	IReadOnlyList<Participant> Participants
);
