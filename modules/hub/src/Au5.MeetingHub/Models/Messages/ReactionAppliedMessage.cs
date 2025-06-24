namespace Au5.MeetingHub.Models.Messages;


public record struct ReactionAppliedMessage : IMessage
{
    public string MeetingId { get; set; }
    public Guid TranscriptBlockId { get; set; }
    public string UserFullName { get; set; }
    public string ReactionType { get; set; }
    public readonly string Type => MessageTypes.ReactionApplied;
}
