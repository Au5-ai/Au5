namespace Au5.Application.Features.AI.Generate;

public record AIGenerateCommand : IStreamRequest<string>
{
	public Guid MeetingId { get; set; }
	public string MeetId { get; set; }
	public string AssistantId { get; set; }
}
