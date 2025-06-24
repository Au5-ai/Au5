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

public record struct Reactions
{
    public List<string> Users { get; set; }
    public string ReactionType { get; set; }
}

public class Meeting
{
    public string MeetingId { get; set; }
    public List<TranscriptionEntryMessage> Transcriptions { get; set; }
    public List<User> Users { get; set; }
    public List<string> Participants { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string Platform { get; set; }
}