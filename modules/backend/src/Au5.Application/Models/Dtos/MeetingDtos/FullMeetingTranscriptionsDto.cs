namespace Au5.Application.Models.Dtos.MeetingDtos;

public record FullMeetingTranscriptionDto(
	Guid id,
	string meetingId,
	Guid creatorUserId,
	Guid botInviterUserId,
	string hashToken,
	string platform,
	string botName,
	bool isBotAdded,
	string createdAt,
	string status,
	IReadOnlyList<ParticipantDto> participants,
	IReadOnlyList<EntryDto> entries
);
