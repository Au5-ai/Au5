using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Org.GetConfig;

public class ConfigOrganizationQueryHandler : IRequestHandler<ConfigOrganizationQuery, Result<Organization>>
{
	private readonly IApplicationDbContext _dbContext;

	public ConfigOrganizationQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<Organization>> Handle(ConfigOrganizationQuery _, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);

		if (existingConfig is not null)
		{
			Error.Failure(description: AppResources.OrganizationIsNotConfigured);
		}

		return existingConfig;
	}
}
