namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class JoinMeetingDto
{
    public string Platform { get; set; }
    public string MeetingId { get; set; }
    public User User { get; set; }
}