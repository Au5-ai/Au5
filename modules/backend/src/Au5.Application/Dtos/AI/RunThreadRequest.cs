namespace Au5.Application.Dtos.AI;

public class RunThreadRequest : OpenAIRequest
{
	public string AssistantId { get; set; }

	public IEnumerable<(string Role, string Content)> Messages { get; set; }

	public bool Stream { get; set; } = false;
}
