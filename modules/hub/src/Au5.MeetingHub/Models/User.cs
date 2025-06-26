namespace Au5.MeetingHub.Models;

public class User
{
    public Guid Id { get; set; }
    public string Token { get; set; }
    public string FullName { get; set; }
    public string PictureUrl { get; set; }
}
