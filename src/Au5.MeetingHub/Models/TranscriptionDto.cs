namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class TranscriptionDto
{
    public string Id { get; set; }
    public string MeetingId { get; set; }
    public string Speaker { get; set; }
    public string Transcript { get; set; }
}
