namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class User
{
    public string Id { get; set; }
    public string FullName { get; set; }

    public string ProfileImage { get; set; }
}
