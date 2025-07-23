namespace Au5.Application.Messages;

public class UserJoinedInMeetingMessage : Message
{
	public override string Type => MessageTypesConstants.UserJoinedInMeeting;

	public string Platform { get; set; }

	public Participant User { get; set; }
}
