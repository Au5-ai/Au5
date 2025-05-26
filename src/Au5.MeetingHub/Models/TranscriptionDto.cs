namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class TranscriptionDto
{
    public string MeetingId { get; set; }   
    public string TranscriptionBlockId { get; set; }
    public User Speaker { get; set; }
    public string Transcript { get; set; }
    public string Timestamp { get; set; }
}