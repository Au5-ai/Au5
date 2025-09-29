namespace Au5.Application.Features.Authentication.GetUserMenus;

public record GetUserMenusQuery() : IRequest<Result<List<GetUserMenusResponse>>>;

public class GetUserMenusResponse
{
	public int Id { get; set; }

	public string Name { get; set; }

	public string Url { get; set; }

	public string Icon { get; set; }

	public List<GetUserMenusResponse> Children { get; set; } = [];
}
