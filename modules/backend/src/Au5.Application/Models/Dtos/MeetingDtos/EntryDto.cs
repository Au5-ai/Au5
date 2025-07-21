namespace Au5.Application.Models.Dtos.MeetingDtos;

public record EntryDto(
	Guid blockId,
	Guid participantId,
	string fullName,
	string content,
	string timestamp,
	string timeline,
	string entryType,
	IReadOnlyList<ReactionDto> reactions
);
