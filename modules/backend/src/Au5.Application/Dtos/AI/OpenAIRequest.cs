using System.Text.Json.Serialization;

namespace Au5.Application.Dtos.AI;

public abstract class OpenAIRequest
{
	[JsonPropertyName("proxy_url")]
	public string ProxyUrl { get; set; }

	[JsonPropertyName("api_key")]
	public string ApiKey { get; set; }
}
