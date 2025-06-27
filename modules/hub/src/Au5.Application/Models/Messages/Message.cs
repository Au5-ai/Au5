namespace Au5.Application.Models.Messages;

public abstract class Message
{
    public string MeetingId { get; set; }
    public abstract string Type { get; }
}
