namespace Au5.Application.Dtos.MeetingDtos;

public record EntryDto
{
	public Guid BlockId { get; init; }

	public Guid ParticipantId { get; init; }

	public string FullName { get; init; }

	public string Content { get; init; }

	public string Timestamp { get; init; }

	public string Timeline { get; init; }

	public string EntryType { get; init; }

	public IReadOnlyList<ReactionDto> Reactions { get; init; }
}
