namespace Au5.Domain.Entities;

[Entity]
public class RoleMenu
{
	public RoleTypes RoleType { get; set; }

	public int MenuId { get; set; }

	public Menu Menu { get; set; }
}
