namespace Au5.Application.Features.UserManagement.Search;

public class SearchUserQueryHandler : IRequestHandler<SearchUserQuery, IReadOnlyCollection<Participant>>
{
	private const int MaxSearchResults = 10;
	private readonly IApplicationDbContext _context;
	private readonly ICurrentUserService _currentUser;

	public SearchUserQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
	{
		_context = context;
		_currentUser = currentUserService;
	}

	public async ValueTask<IReadOnlyCollection<Participant>> Handle(SearchUserQuery request, CancellationToken cancellationToken)
	{
		if (string.IsNullOrEmpty(request.Query))
		{
			return Array.Empty<Participant>();
		}

		var query = _context.Set<User>().Where(u => u.IsActive && u.OrganizationId == _currentUser.OrganizationId);
		query = query.Where(u => u.FullName.StartsWith(request.Query) || u.Email.StartsWith(request.Query));

		var users = await query
			.Select(u => new Participant
			{
				Id = u.Id,
				FullName = u.FullName,
				Email = u.Email,
				PictureUrl = u.PictureUrl
			})
			.Take(MaxSearchResults)
			.ToListAsync(cancellationToken);

		return users;
	}
}
