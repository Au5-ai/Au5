namespace Au5.MeetingHub.Models.Messages;

public abstract class Message
{
    public string MeetingId { get; set; }
    public abstract string Type { get; }
}
