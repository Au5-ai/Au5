namespace Au5.MeetingHub.Models;

public class JoinMeetingDto
{
    public string MeetingId { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public string FullName { get; set; } = default!;
}
