namespace Au5.MeetingHub.Models;
public class Message
{
    public Header Header { get; set; }
    public object Payload { get; set; }
}

public class Header
{
    public string Type { get; set; }
}
