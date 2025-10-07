namespace Au5.Domain.Entities;

[Entity]
public class AIContents
{
	public int Id { get; set; }

	public Guid UserId { get; set; }

	public User User { get; set; }

	public Guid MeetingId { get; set; }

	public Meeting Meeting { get; set; }

	public int AssistantId { get; set; }

	public Assistant Assistant { get; set; }

	public string Content { get; set; }

	public DateTime CreatedAt { get; set; }
}
