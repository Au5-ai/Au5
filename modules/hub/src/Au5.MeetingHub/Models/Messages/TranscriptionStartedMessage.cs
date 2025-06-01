namespace Au5.MeetingHub.Models.Messages;

public record struct TranscriptionStartedMessage(Guid UserId) : IMessage
{
    public readonly string Type => MessageTypes.TriggerTranscriptionStart;
}