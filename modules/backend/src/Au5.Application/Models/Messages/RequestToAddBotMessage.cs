namespace Au5.Application.Models.Messages;

public class RequestToAddBotMessage : Message
{
	public override string Type => MessageTypesConstants.RequestToAddBot;

	public Participant User { get; set; }

	public string BotName { get; set; }

	public string Platform { get; set; }
}
