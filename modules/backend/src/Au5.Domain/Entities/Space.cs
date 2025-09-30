namespace Au5.Domain.Entities;

[Entity]
public class Space
{
	public Guid Id { get; set; }

	public string Name { get; set; }

	public string Description { get; set; }

	public DateTime CreatedAt { get; set; }

	public DateTime? UpdatedAt { get; set; }

	public bool IsActive { get; set; }

	public Guid? ParentId { get; set; }

	public Space Parent { get; set; }

	public ICollection<Space> Children { get; set; }

	// Many-to-many relationship with Users
	public ICollection<UserSpace> UserSpaces { get; set; }
}
