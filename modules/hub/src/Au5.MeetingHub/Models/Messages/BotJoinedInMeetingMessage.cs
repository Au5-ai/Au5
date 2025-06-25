namespace Au5.MeetingHub.Models.Messages;

public class BotJoinedInMeetingMessage : Message
{
    public override string Type => MessageTypes.BotJoinedInMeeting;
    public string BotName { get; init; }
}
