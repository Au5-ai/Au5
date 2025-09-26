namespace Au5.Domain.Entities;

[Entity]
public class Assistant
{
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string Icon { get; set; }

	public string Description { get; set; }

	public string Prompt { get; set; }

	public bool IsDefault { get; set; }

	public bool IsActive { get; set; }

	public DateTime CreatedAt { get; set; }
}
