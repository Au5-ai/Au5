namespace Au5.Domain.Entities;

[Entity]
public class Assistant
{
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string Icon { get; set; }

	public string Description { get; set; }

	public string Instructions { get; set; }

	public string LLMModel { get; set; }

	public string OpenAIAssistantId { get; set; }

	public User User { get; set; }

	public Guid UserId { get; set; }

	public bool IsDefault { get; set; }

	public bool IsActive { get; set; }

	public DateTime CreatedAt { get; set; }
}
