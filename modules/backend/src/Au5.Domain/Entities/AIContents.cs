namespace Au5.Domain.Entities;

[Entity]
public class AIContents
{
	public Guid Id { get; set; }

	public Guid UserId { get; set; }

	public User User { get; set; }

	public Guid MeetingId { get; set; }

	public Meeting Meeting { get; set; }

	public Guid AssistantId { get; set; }

	public Assistant Assistant { get; set; }

	public string Content { get; set; }

	public int CompletionTokens { get; set; }

	public int PromptTokens { get; set; }

	public int TotalTokens { get; set; }

	public DateTime CreatedAt { get; set; }

	public bool IsActive { get; set; }

	public Guid RemoverUserId { get; set; }
}
