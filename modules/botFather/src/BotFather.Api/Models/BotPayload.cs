namespace BotFather.Api.Models;

public record BotPayload
{
	[JsonPropertyName("hubUrl")]
	public string HubUrl { get; init; }

	[JsonPropertyName("platform")]
	public string Platform { get; init; }

	[JsonPropertyName("meetingUrl")]
	public string MeetingUrl { get; init; }

	[JsonPropertyName("botDisplayName")]
	public string BotDisplayName { get; init; }

	[JsonPropertyName("meetId")]
	public string MeetId { get; init; }

	[JsonPropertyName("hashToken")]
	public string HashToken { get; init; }

	[JsonPropertyName("jwtToken")]
	public string JwtToken { get; init; }

	[JsonPropertyName("language")]
	public string Language { get; init; }

	[JsonPropertyName("autoLeave")]
	public AutoLeaveSettings AutoLeaveSettings { get; init; }

	[JsonPropertyName("meeting_settings")]
	public MeetingSettings MeetingSettings { get; set; }
}
