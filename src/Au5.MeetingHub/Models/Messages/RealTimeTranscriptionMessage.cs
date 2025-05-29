namespace Au5.MeetingHub.Models.Messages;

public record struct RealTimeTranscriptionMessage : IMessage
{
    public string MeetingId { get; set; }
    public string TranscriptionBlockId { get; set; }
    public User Speaker { get; set; }
    public string Transcript { get; set; }
    public string Timestamp { get; set; }

    public readonly string Type => MessageTypes.NotifyRealTimeTranscription;
}
