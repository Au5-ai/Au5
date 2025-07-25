namespace Au5.Application.Dtos.MeetingDtos;

public record EntryDto(
	Guid BlockId,
	Guid ParticipantId,
	string FullName,
	string Content,
	string Timestamp,
	string Timeline,
	string EntryType,
	IReadOnlyList<ReactionDto> Reactions
);
