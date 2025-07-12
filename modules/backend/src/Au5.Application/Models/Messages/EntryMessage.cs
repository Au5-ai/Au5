namespace Au5.Application.Models.Messages;

public class EntryMessage : Message
{
	public override string Type => MessageTypesConstants.Entry;

	public Guid BlockId { get; set; }

	public string Content { get; set; }

	public DateTime Timestamp { get; set; }

	public string EntryType { get; set; }

	public Participant Participant { get; set; }
}
