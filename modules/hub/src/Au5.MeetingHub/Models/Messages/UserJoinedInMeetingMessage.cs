namespace Au5.MeetingHub.Models.Messages;

public class UserJoinedInMeetingMessage : Message
{
    public override string Type => MessageTypes.UserJoinedInMeeting;

    public string Platform { get; set; }
    public User User { get; set; }
}