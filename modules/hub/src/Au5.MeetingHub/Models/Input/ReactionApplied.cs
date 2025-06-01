namespace Au5.MeetingHub.Models.Input;

public class ReactionApplied
{
    public string MeetingId { get; set; }
    public Guid TranscriptBlockId { get; set; }
    public User User { get; set; }
    public string Reaction { get; set; }
}
