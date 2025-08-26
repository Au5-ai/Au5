using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Administration.HelloAdmin;

public class HelloAdminQueryHandler : IRequestHandler<HelloAdminQuery, Result<HelloAdminResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public HelloAdminQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<HelloAdminResponse>> Handle(HelloAdminQuery request, CancellationToken cancellationToken)
	{
		var admin = await _dbContext.Set<User>().FirstOrDefaultAsync(x => x.Role == RoleTypes.Admin && x.IsActive, cancellationToken);
		return new HelloAdminResponse
		{
			HelloFromAdmin = admin is not null
		};
	}
}
