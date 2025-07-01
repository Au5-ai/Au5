namespace Au5.Application.Models.Messages;

public class UserJoinedInMeetingMessage : Message
{
	public override string Type => MessageTypes.UserJoinedInMeeting;

	public string Platform { get; set; }
	public UserDto User { get; set; }
}