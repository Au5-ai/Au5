using System.Text.Json.Serialization;

namespace Au5.Application.Services.Models;

public record BotPayload
{
	public string HubUrl { get; init; }

	public string Platform { get; init; }

	public string MeetingUrl { get; init; }

	public string BotDisplayName { get; init; }

	public string MeetId { get; init; }

	public string HashToken { get; init; }

	public string Language { get; init; }

	[JsonPropertyName("autoLeave")]
	public AutoLeaveSettings AutoLeaveSettings { get; init; }

	[JsonPropertyName("meeting_settings")]
	public MeetingSettings MeetingSettings { get; set; }
}

public record AutoLeaveSettings
{
	public int WaitingEnter { get; init; }

	public int NoParticipant { get; init; }

	public int AllParticipantsLeft { get; init; }
}

public record MeetingSettings
{
	[JsonPropertyName("transcription_model")]
	public string TranscriptionModel { get; init; }

	[JsonPropertyName("video_recording")]
	public bool VideoRecording { get; init; }

	[JsonPropertyName("audio_recording")]
	public bool AudioRecording { get; init; }

	public bool Transcription { get; init; }
}
