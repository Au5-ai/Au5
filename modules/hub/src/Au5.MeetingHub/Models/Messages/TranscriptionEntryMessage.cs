namespace Au5.MeetingHub.Models.Messages;

public record struct TranscriptionEntryMessage : IMessage
{
    public string MeetingId { get; set; }
    public Guid TranscriptBlockId { get; set; }
    public User Speaker { get; set; }
    public string Transcript { get; set; }
    public string Timestamp { get; set; }

    public List<Reactions> Reactions { get; set; }
    public readonly string Type => MessageTypes.TranscriptionEntry;
}
