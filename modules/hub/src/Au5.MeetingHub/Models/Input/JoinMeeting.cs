namespace Au5.MeetingHub.Models.Input;

public record JoinMeeting
{
    public Platform Platform { get; set; } = Platform.GoogleMeet;
    public string MeetingId { get; set; }
    public User User { get; set; }
}