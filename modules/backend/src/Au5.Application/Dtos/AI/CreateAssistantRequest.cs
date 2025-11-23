namespace Au5.Application.Dtos.AI;

public class CreateAssistantRequest
{
	public string Name { get; set; }

	public string Instructions { get; set; }

	public string Model { get; set; }
}
