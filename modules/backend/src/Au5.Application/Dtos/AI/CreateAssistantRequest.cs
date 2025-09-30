namespace Au5.Application.Dtos.AI;

public class CreateAssistantRequest : OpenAIRequest
{
	public string Instructions { get; set; }

	public string Name { get; set; }

	public IEnumerable<string> Tools { get; set; }

	public string Model { get; set; }
}
