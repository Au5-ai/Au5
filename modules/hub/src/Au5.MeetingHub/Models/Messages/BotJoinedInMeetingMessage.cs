namespace Au5.MeetingHub.Models.Messages;

public record struct BotJoinedInMeetingMessage(string MeetingId, string BotName) : IMessage
{
    public readonly string Type => MessageTypes.BotJoinedInMeeting;
}
