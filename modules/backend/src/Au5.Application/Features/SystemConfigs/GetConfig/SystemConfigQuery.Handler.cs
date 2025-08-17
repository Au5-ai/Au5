using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.SystemConfigs.GetConfig;

public class SystemConfigQueryHandler : IRequestHandler<SystemConfigQuery, Result<SystemConfig>>
{
	private readonly IApplicationDbContext _dbContext;

	public SystemConfigQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<SystemConfig>> Handle(SystemConfigQuery _, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<SystemConfig>().FirstOrDefaultAsync(cancellationToken);

		if (existingConfig is null)
		{
			return Error.Failure(description: AppResources.SystemIsNotConfigured);
		}

		return existingConfig;
	}
}
