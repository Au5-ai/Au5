namespace Au5.Domain.Entities;

public class Entry
{
    public string MeetingId { get; set; }
    public string BlockId { get; set; }
    public User Speaker { get; set; }
    public string Content { get; set; }
    public string Timestamp { get; set; }
    public string EntryType { get; set; }
    public List<Reactions> Reactions { get; set; }
}