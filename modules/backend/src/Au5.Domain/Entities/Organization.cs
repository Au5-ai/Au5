using System.Text.Json.Serialization;

namespace Au5.Domain.Entities;

[Entity]
public class Organization
{
	[JsonIgnore]
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string BotName { get; set; }

	public string HubUrl { get; set; }

	public string Direction { get; set; }

	public string Language { get; set; }

	public string ServiceBaseUrl { get; set; }

	[JsonIgnore]
	public string OpenAIToken { get; set; }

	public string PanelUrl { get; set; }
}
