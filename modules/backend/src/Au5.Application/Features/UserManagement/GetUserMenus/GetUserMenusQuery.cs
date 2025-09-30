namespace Au5.Application.Features.UserManagement.GetUserMenus;

public record GetUserMenusQuery() : IRequest<Result<List<GetUserMenusResponse>>>;

public class GetUserMenusResponse
{
	public int Id { get; set; }

	public string Title { get; set; }

	public string Url { get; set; }

	public string Icon { get; set; }

	public bool ShowBadge { get; set; }

	public string Badge { get; set; }

	public List<GetUserMenusResponse> Children { get; set; } = [];
}
