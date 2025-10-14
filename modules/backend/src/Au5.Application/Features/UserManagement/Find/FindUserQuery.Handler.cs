namespace Au5.Application.Features.UserManagement.Find;

public class FindUserQueryHandler : IRequestHandler<FindUserQuery, IReadOnlyCollection<Participant>>
{
	private readonly IApplicationDbContext _context;

	public FindUserQueryHandler(IApplicationDbContext context)
	{
		_context = context;
	}

	public async ValueTask<IReadOnlyCollection<Participant>> Handle(FindUserQuery request, CancellationToken cancellationToken)
	{
		if (string.IsNullOrEmpty(request.FullName) == string.IsNullOrEmpty(request.Email))
		{
			return Array.Empty<Participant>();
		}

		var query = _context.Set<User>().Where(u => u.IsActive);

		if (!string.IsNullOrEmpty(request.FullName))
		{
			query = query.Where(u => u.FullName.Contains(request.FullName));
		}
		else if (!string.IsNullOrEmpty(request.Email))
		{
			query = query.Where(u => u.Email.Contains(request.Email));
		}

		var users = await query
			.Select(u => new Participant
			{
				Id = u.Id,
				FullName = u.FullName,
				Email = u.Email,
				PictureUrl = u.PictureUrl
			})
			.Take(25)
			.ToListAsync(cancellationToken);

		return users;
	}
}
