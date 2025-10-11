using System.Text.Json.Serialization;

namespace Au5.Application.Dtos.AI;

public class RunThreadRequest : OpenAIRequest
{
	[JsonPropertyName("assistant_id")]
	public string AssistantId { get; set; }

	[JsonPropertyName("thread")]
	public Thread Thread { get; set; }

	[JsonPropertyName("stream")]
	public bool Stream { get; set; } = true;
}
