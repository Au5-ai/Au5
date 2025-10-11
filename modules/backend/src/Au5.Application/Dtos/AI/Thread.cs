using System.Text.Json.Serialization;

namespace Au5.Application.Dtos.AI;

public class Thread
{
	[JsonPropertyName("messages")]
	public IEnumerable<ThreadMessage> Messages { get; set; }
}
