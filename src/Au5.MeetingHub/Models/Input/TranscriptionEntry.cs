namespace Au5.MeetingHub.Models.Input;

public record TranscriptionEntry
{
    public string MeetingId { get; set; }
    public string TranscriptionBlockId { get; set; }
    public User Speaker { get; set; }
    public string Transcript { get; set; }
    public string Timestamp { get; set; }
}