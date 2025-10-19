namespace Au5.Domain.Entities;

[Entity]
public class MeetingSpace
{
	public Guid MeetingId { get; set; }

	public Meeting Meeting { get; set; }

	public Guid SpaceId { get; set; }

	public Space Space { get; set; }

	public DateTime CreatedAt { get; set; }

	public Guid UserId { get; set; }

	public User User { get; set; }
}
