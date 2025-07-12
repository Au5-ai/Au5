namespace Au5.Application.Models.Messages;

public class MeetingIsActiveMessage : Message
{
	public override string Type => MessageTypesConstants.MeetingIsActive;

	public string BotName { get; set; }
}
