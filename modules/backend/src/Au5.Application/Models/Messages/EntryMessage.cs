namespace Au5.Application.Models.Messages;

public class EntryMessage : Message
{
	public override string Type => MessageTypes.Entry;

	public string BlockId { get; set; }

	public UserDto Speaker { get; set; }

	public string Content { get; set; }

	public string Timestamp { get; set; }

	public string EntryType { get; set; }
}