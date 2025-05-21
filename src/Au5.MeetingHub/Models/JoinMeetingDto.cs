namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class JoinMeetingDto
{
    public string MeetingId { get; set; }

    public string UserId { get; set; }

    public string FullName { get; set; }

    public string ProfileImage { get; set; }
}