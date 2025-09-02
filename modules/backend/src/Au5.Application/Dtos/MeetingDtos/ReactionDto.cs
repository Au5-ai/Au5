namespace Au5.Application.Dtos.MeetingDtos;

public record ReactionDto
{
	public int Id { get; init; }

	public string Type { get; init; }

	public string Emoji { get; init; }

	public string ClassName { get; init; }

	public IReadOnlyList<Participant> Participants { get; init; }
}
