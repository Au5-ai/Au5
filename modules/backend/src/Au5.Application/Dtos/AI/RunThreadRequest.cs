namespace Au5.Application.Dtos.AI;

public class RunThreadRequest
{
	public string AssistantId { get; set; }

	public IEnumerable<string> Messages { get; set; }
}
