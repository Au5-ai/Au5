using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.UserManagement.GetUsers;

public class GetUsersQueryHandler(IApplicationDbContext applicationDbContext) : IRequestHandler<GetUsersQuery, List<User>>
{
	private readonly IApplicationDbContext _dbContext = applicationDbContext;

	public async ValueTask<List<User>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
	{
		var users = await _dbContext.Set<User>()
			.AsNoTracking()
			.ToListAsync(cancellationToken);

		return users;
	}
}
