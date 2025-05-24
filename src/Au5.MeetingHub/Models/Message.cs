namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class Message
{
    public Header Header { get; set; }
    public object Payload { get; set; }
}

[MessagePackObject(keyAsPropertyName: true)]
public class Header
{
    public string Type { get; set; }
}
