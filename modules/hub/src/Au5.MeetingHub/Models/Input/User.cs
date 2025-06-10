namespace Au5.MeetingHub.Models.Input;

public record User
{
    public Guid Id { get; set; }
    public string Token { get; set; }
    public string FullName { get; set; }
    public string PictureUrl { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.Now;
}
