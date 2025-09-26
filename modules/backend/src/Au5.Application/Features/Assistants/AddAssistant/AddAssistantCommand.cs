namespace Au5.Application.Features.Assistants.AddAssistant;

public class AddAssistantCommand : IRequest<Result<AddAssisstantResponse>>
{
	public string Name { get; init; }

	public string Icon { get; init; }

	public string Description { get; init; }

	public string Prompt { get; init; }
}

public record AddAssisstantResponse(Guid Id);
