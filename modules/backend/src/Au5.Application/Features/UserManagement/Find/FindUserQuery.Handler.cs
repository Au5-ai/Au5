namespace Au5.Application.Features.UserManagement.Find;

public class FindUserQueryHandler : IRequestHandler<FindUserQuery, IReadOnlyCollection<Participant>>
{
	private const int MaxSearchResults = 25;
	private readonly IApplicationDbContext _context;

	public FindUserQueryHandler(IApplicationDbContext context)
	{
		_context = context;
	}

	public async ValueTask<IReadOnlyCollection<Participant>> Handle(FindUserQuery request, CancellationToken cancellationToken)
	{
		if (string.IsNullOrEmpty(request.Query))
		{
			return Array.Empty<Participant>();
		}

		var query = _context.Set<User>().Where(u => u.IsActive);
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
