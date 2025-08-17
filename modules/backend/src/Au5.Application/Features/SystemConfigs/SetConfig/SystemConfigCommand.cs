namespace Au5.Application.Features.SystemConfigs.SetConfig;

public record SystemConfigCommand : IRequest<Result>
{
	public string OrganizationName { get; init; }

	public string BotName { get; init; }

	public string HubUrl { get; init; }

	public string Direction { get; init; }

	public string Language { get; init; }

	public string ServiceBaseUrl { get; init; }

	public string BotFatherUrl { get; set; }

	public string BotHubUrl { get; set; }

	public string PanelUrl { get; init; }

	public string OpenAIToken { get; init; }

	public int AutoLeaveWaitingEnter { get; set; }

	public int AutoLeaveNoParticipant { get; set; }

	public int AutoLeaveAllParticipantsLeft { get; set; }

	public bool MeetingVideoRecording { get; set; }

	public bool MeetingAudioRecording { get; set; }

	public bool MeetingTranscription { get; set; }

	public string MeetingTranscriptionModel { get; set; }

	public bool ForceUpdate { get; init; } = false;
}
