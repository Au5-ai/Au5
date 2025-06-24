namespace Au5.MeetingHub.Models.Messages;

public record struct GeneralMessage(string MeetingId, string Content) : IMessage
{
    public readonly string Type => MessageTypes.GeneralMessage;
}
