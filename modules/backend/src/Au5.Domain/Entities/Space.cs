namespace Au5.Domain.Entities;

[Entity]
public class Space
{
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string Description { get; set; }

	public bool IsActive { get; set; }

	public ICollection<UserSpace> UserSpaces { get; set; }

	public ICollection<MeetingSpace> MeetingSpaces { get; set; }
}
