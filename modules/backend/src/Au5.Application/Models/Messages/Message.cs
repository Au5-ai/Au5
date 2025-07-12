namespace Au5.Application.Models.Messages;

public abstract class Message
{
	public string MeetId { get; set; }

	public abstract string Type { get; }
}
