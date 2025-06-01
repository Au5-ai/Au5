namespace Au5.MeetingHub.Models.Messages;

public record struct ListOfUsersInMeetingMessage(IReadOnlyList<User> Users) : IMessage
{
    public readonly string Type => MessageTypes.ListOfUsersInMeeting;
}

public record struct UserJoinedInMeetingMessage(User User) : IMessage
{
    public readonly string Type => MessageTypes.NotifyUserJoining;
}