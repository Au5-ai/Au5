namespace Au5.MeetingHub.Models;

public class TranscriptionDto
{
    public string Id { get; set; } = default!;
    public string MeetingId { get; set; } = default!;
    public string Speaker { get; set; } = default!;
    public string Transcript { get; set; } = default!;
}
