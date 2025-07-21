namespace Au5.Application.Models.Dtos.MeetingDtos;

public record ReactionDto(
	int id,
	string type,
	string emoji,
	string className,
	IReadOnlyList<Guid> users
);
