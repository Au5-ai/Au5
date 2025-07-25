namespace Au5.Application.Messages;

public abstract class Message
{
	public string MeetId { get; set; }

	public abstract string Type { get; }
}
