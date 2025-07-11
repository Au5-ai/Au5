namespace Au5.Application.Models.Messages;

public class BotJoinedInMeetingMessage : Message
{
	public override string Type => MessageTypesConstants.BotJoinedInMeeting;

	public string BotName { get; init; }
}
