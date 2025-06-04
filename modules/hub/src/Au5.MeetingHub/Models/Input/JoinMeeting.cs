namespace Au5.MeetingHub.Models.Input;

public record JoinMeeting
{
    public string MeetingId { get; set; }
    public User User { get; set; }
}