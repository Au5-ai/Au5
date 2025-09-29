using System.Text.Json.Serialization;

namespace Au5.Application.Features.SystemConfigs.GetConfig;

public record SystemConfigResponse
{
	public string OrganizationName { get; set; }

	public string BotName { get; set; }

	public string HubUrl { get; set; }

	public string Direction { get; set; }

	public string Language { get; set; }

	public string ServiceBaseUrl { get; set; }

	public string BotFatherUrl { get; set; }

	public string BotHubUrl { get; set; }

	[JsonIgnore]
	public string OpenAIToken { get; set; }

	public string OpenAIProxyUrl { get; set; }

	public string PanelUrl { get; set; }

	public int AutoLeaveWaitingEnter { get; set; }

	public int AutoLeaveNoParticipant { get; set; }

	public int AutoLeaveAllParticipantsLeft { get; set; }

	public bool MeetingVideoRecording { get; set; }

	public bool MeetingAudioRecording { get; set; }

	public bool MeetingTranscription { get; set; }

	public string MeetingTranscriptionModel { get; set; }

	public bool SmtpUseSSl { get; set; }

	public string SmtpHost { get; set; }

	public int SmtpPort { get; set; }

	public string SmtpUser { get; set; }

	public string SmtpPassword { get; set; }
}
