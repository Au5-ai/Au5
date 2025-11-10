namespace Au5.Application.Features.AI.Generate;

public record AIGenerateCommand : IStreamRequest<string>
{
	public Guid MeetingId { get; set; }
	public Guid AssistantId { get; set; }
}
