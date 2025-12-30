namespace BotFather.Api.Models;

public record AutoLeaveSettings
{
	[JsonPropertyName("waitingEnter")]
	public int WaitingEnter { get; init; }

	[JsonPropertyName("noParticipant")]
	public int NoParticipant { get; init; }

	[JsonPropertyName("allParticipantsLeft")]
	public int AllParticipantsLeft { get; init; }
}
