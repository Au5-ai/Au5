namespace Au5.MeetingHub.Models.Messages;

public class RequestToAddBotMessage : Message
{
    public override string Type => MessageTypes.RequestToAddBot;
    public User User { get; set; }
    public string BotName { get; set; }
}
