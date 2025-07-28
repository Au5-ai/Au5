namespace Au5.Domain.Entities;

[Entity]
public class Organization
{
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string BotName { get; set; }

	public string HubUrl { get; set; }

	public string Direction { get; set; }

	public string Language { get; set; }

	public string ServiceBaseUrl { get; set; }

	public string OpenAIToken { get; set; }

	public string PanelUrl { get; set; }
}
