namespace Au5.MeetingHub.Models.Messages;

public record struct UserJoinedInMeetingMessage(User User) : IMessage
{
    public readonly string Type => MessageTypes.NotifyUserJoining;
}