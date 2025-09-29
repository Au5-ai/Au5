namespace Au5.Domain.Entities;

[Entity]
public class Menu
{
	public int Id { get; set; }

	public string Title { get; set; }

	public string Url { get; set; }

	public string Icon { get; set; }

	public int? ParentId { get; set; }

	public int SortOrder { get; set; }

	public bool IsActive { get; set; }

	public Menu Parent { get; set; }

	public ICollection<Menu> Children { get; set; } = [];

	public ICollection<RoleMenu> RoleMenus { get; set; } = [];
}
