namespace Au5.MeetingHub.Models.Entity;

public class TranscriptionEntry 
{
    public string MeetingId { get; set; }
    public string TranscriptBlockId { get; set; }
    public User Speaker { get; set; }
    public string Transcript { get; set; }
    public string Timestamp { get; set; }
     public List<Reactions> Reactions { get; set; }
}