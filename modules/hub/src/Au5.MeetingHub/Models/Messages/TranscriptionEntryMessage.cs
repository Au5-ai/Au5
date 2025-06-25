namespace Au5.MeetingHub.Models.Messages;

public class EntryMessage : Message
{
    public override string Type => MessageTypes.Entry;
    public string BlockId { get; set; }
    public User Speaker { get; set; }
    public string Content { get; set; }
    public string Timestamp { get; set; }
    public string EntryType { get; set; }
}