namespace Au5.MeetingHub.Models.Messages;

public class ReactionAppliedMessage : Message
{
    public override string Type => MessageTypes.ReactionApplied;
    public string TranscriptBlockId { get; set; }
    public string UserFullName { get; set; }
    public string ReactionType { get; set; }
}
