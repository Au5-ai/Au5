namespace Au5.Application.Models.Dtos.MeetingDtos;

public record ParticipantDto(
	Guid userId,
	string fullName,
	string pictureUrl
);
