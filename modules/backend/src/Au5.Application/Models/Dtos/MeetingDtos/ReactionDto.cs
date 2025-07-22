namespace Au5.Application.Models.Dtos.MeetingDtos;

public record ReactionDto(
	int Id,
	string Type,
	string Emoji,
	IReadOnlyList<Guid> Users
);
