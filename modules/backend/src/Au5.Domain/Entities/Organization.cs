using System.Text.Json.Serialization;

namespace Au5.Domain.Entities;

[Entity]
public class Organization
{
	[JsonIgnore]
	public Guid Id { get; set; }

	public string OrganizationName { get; set; }

	public string BotName { get; set; }

	public string Direction { get; set; }

	public string Language { get; set; }

	[JsonIgnore]
	public ICollection<User> Users { get; set; }

	[JsonIgnore]
	public ICollection<Reaction> Reactions { get; set; }

	[JsonIgnore]
	public ICollection<Assistant> Assistants { get; set; }
}
