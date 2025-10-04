using System.Text.Json.Serialization;

namespace Au5.Application.Dtos.AI;

public abstract class OpenAIRequest
{
	[JsonPropertyName("proxy_url")]
	public string ProxyUrl { get; set; }

	[JsonPropertyName("apiKey")]
	public string ApiKey { get; set; }
}
