namespace BotFather.Api.Models;

public record MeetingSettings
{
	[JsonPropertyName("transcription_model")]
	public string TranscriptionModel { get; init; }

	[JsonPropertyName("video_recording")]
	public bool VideoRecording { get; init; }

	[JsonPropertyName("audio_recording")]
	public bool AudioRecording { get; init; }

	[JsonPropertyName("transcription")]
	public bool Transcription { get; init; }
}
