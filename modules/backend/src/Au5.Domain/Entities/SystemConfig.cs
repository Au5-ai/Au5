using System.Text.Json.Serialization;

namespace Au5.Domain.Entities;

[Entity]
public class SystemConfig
{
	[JsonIgnore]
	public Guid Id { get; set; }

	public string OrganizationName { get; set; }

	public string BotName { get; set; }

	public string HubUrl { get; set; }

	public string Direction { get; set; }

	public string Language { get; set; }

	public string ServiceBaseUrl { get; set; }

	[JsonIgnore]
	public string OpenAIToken { get; set; }

	public string PanelUrl { get; set; }

	public int AutoLeaveWaitingEnter { get; set; }

	public int AutoLeaveNoParticipant { get; set; }

	public int AutoLeaveAllParticipantsLeft { get; set; }

	public bool MeetingVideoRecording { get; set; }

	public bool MeetingAudioRecording { get; set; }

	public bool MeetingTranscription { get; set; }

	public string MeetingTranscriptionModel { get; set; }
}
