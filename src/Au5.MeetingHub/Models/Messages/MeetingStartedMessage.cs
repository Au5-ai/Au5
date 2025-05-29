namespace Au5.MeetingHub.Models.Messages;

public record struct MeetingStartedMessage(bool IsStarted) : IMessage
{
    public readonly string Type => MessageTypes.NotifyMeetHasBeenStarted;
}
