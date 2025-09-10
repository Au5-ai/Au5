namespace Au5.Application.Features.UserManagement.Search;

public class SearchUsersQuery : IRequest<List<User>>
{
	public SearchUsersQuery(string query, Dictionary<string, string> filters)
	{
		Query = query;
		Filters = filters;
	}

	public string Query { get; }

	public Dictionary<string, string> Filters { get; }
}
