namespace Au5.Application.Models.Messages;

public class ReactionAppliedMessage : Message
{
    public override string Type => MessageTypes.ReactionApplied;
    public string BlockId { get; set; }
    public UserDto User { get; set; }
    public string ReactionType { get; set; }
}
