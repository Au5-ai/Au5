namespace Au5.Application.Models.Dtos.MeetingDtos;

public record EntryDto(
	Guid blockId,
	Guid participantId,
	string content,
	string timestamp,
	string timeline,
	string entryType,
	IReadOnlyList<ReactionDto> reactions
);
