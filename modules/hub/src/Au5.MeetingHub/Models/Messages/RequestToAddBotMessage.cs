namespace Au5.MeetingHub.Models.Messages;

public record struct  RequestToAddBotMessage( User User,string MeetingId, string BotName) : IMessage
{
    public readonly string Type => MessageTypes.RequestToAddBot;
    
}
