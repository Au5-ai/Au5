namespace Au5.MeetingHub.Models;

[MessagePackObject(keyAsPropertyName: true)]
public class User
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string PictureUrl { get; set; }

    public override bool Equals(object obj) => obj is User u && u.Id == Id;
    public override int GetHashCode() => Id.GetHashCode();
}
