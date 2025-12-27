namespace Au5.Application.Messages;

public class CloseMeetingMessage : Message
{
	public override string Type => MessageTypesConstants.CloseMeeting;

	public string MeetingId { get; set; }
}
