namespace Au5.Application.Features.UserManagement.GetUsers;

public class GetUsersQueryHandler(IApplicationDbContext applicationDbContext, ICurrentUserService currentUserService)
	: IRequestHandler<GetUsersQuery, IReadOnlyCollection<User>>
{
	private readonly IApplicationDbContext _dbContext = applicationDbContext;
	private readonly ICurrentUserService _currentUser = currentUserService;

	public async ValueTask<IReadOnlyCollection<User>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
	{
		var users = await _dbContext.Set<User>()
			.Where(x => x.OrganizationId == _currentUser.OrganizationId)
			.AsNoTracking()
			.ToListAsync(cancellationToken);

		return users;
	}
}
