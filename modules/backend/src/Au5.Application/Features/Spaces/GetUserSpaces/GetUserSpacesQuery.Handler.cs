namespace Au5.Application.Features.Spaces.GetUserSpaces;

public class GetUserSpacesQueryHandler : IRequestHandler<GetUserSpacesQuery, IReadOnlyCollection<UserSpaceResponse>>
{
	private readonly IApplicationDbContext _context;
	private readonly ICurrentUserService _currentUserService;

	public GetUserSpacesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
	{
		_context = context;
		_currentUserService = currentUserService;
	}

	public async ValueTask<IReadOnlyCollection<UserSpaceResponse>> Handle(GetUserSpacesQuery request, CancellationToken cancellationToken)
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
				Description = us.Space.Description
			})
			.ToListAsync(cancellationToken);

		return userSpaces;
	}
}
