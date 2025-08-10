namespace Au5.Domain.Entities;

[Entity]
public class Reaction
{
	public int Id { get; set; }

	public string Type { get; set; }

	public string Emoji { get; set; }

	public string ClassName { get; set; }

	public bool IsActive { get; set; }
}
