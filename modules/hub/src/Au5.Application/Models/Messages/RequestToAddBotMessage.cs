namespace Au5.Application.Models.Messages;

public class RequestToAddBotMessage : Message
{
	public override string Type => MessageTypes.RequestToAddBot;
	public UserDto User { get; set; }
	public string BotName { get; set; }
}
