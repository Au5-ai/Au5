namespace Au5.Application.Features.Spaces.GetUserSpaces;

public class GetUserSpacesQueryHandler : IRequestHandler<UserSpacesQuery, Result<IReadOnlyCollection<UserSpaceResponse>>>
{
	private readonly IApplicationDbContext _context;
	private readonly ICurrentUserService _currentUserService;

	public GetUserSpacesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
	{
		_context = context;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<IReadOnlyCollection<UserSpaceResponse>>> Handle(UserSpacesQuery request, CancellationToken cancellationToken)
	{
		var userId = _currentUserService.UserId;

		var userSpaces = await _context.Set<UserSpace>()
			.Include(us => us.Space)
			.Where(us => us.UserId == userId && us.Space.IsActive)
			.AsNoTracking()
			.Select(us => new UserSpaceResponse
			{
				Id = us.SpaceId,
				Name = us.Space.Name,
				Description = us.Space.Description,
				IsAdmin = us.IsAdmin
			})
			.ToListAsync(cancellationToken);

		return userSpaces;
	}
}
