using System.Text.Json.Serialization;

namespace Au5.Application.Dtos.AI;

public class ThreadMessage
{
	[JsonPropertyName("role")]
	public string Role { get; set; }

	[JsonPropertyName("content")]
	public string Content { get; set; }
}
