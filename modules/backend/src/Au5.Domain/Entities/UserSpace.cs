namespace Au5.Domain.Entities;

[Entity]
public class UserSpace
{
	public Guid UserId { get; set; }

	public User User { get; set; }

	public Guid SpaceId { get; set; }

	public Space Space { get; set; }

	public DateTime JoinedAt { get; set; }

	public bool IsAdmin { get; set; }
}
