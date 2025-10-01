using System.Text.Json.Serialization;

namespace Au5.Application.Dtos.AI;

public class CreateAssistantRequest : OpenAIRequest
{
	[JsonPropertyName("name")]
	public string Name { get; set; }

	[JsonPropertyName("instructions")]
	public string Instructions { get; set; }

	[JsonPropertyName("model")]
	public string Model { get; set; }

	[JsonPropertyName("tools")]
	public IEnumerable<string> Tools { get; set; }
}
