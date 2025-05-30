namespace Au5.MeetingHub.Models.Messages;


public record struct ReactionAppliedMessage : IMessage
{
    public string MeetingId { get; set; }
    public string TrancriptBlockId { get; set; }
    public User User { get; set; }
    public string Reaction { get; set; }
    public readonly string Type => MessageTypes.ReactionApplied;
}
