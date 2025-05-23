namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class StartTranscriptionDto
{
    public string MeetingId { get; set; }
    public User User { get; set; }
}
