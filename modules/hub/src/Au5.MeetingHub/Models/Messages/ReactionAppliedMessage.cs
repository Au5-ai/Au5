namespace Au5.MeetingHub.Models.Messages;

public class ReactionAppliedMessage : Message
{
    public override string Type => MessageTypes.ReactionApplied;
    public string BlockId { get; set; }
    public Guid UserId { get; set; }
    public string ReactionType { get; set; }
}
