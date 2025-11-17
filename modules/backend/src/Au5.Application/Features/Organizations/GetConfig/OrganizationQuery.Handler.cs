using Au5.Application.Common;

namespace Au5.Application.Features.Organizations.GetConfig;

public class OrganizationQueryHandler : IRequestHandler<OrganizationQuery, Result<OrganizationResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public OrganizationQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<OrganizationResponse>> Handle(OrganizationQuery _, CancellationToken cancellationToken)
	{
		var organization = await _dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);

		return organization is null
			? Error.Failure(description: AppResources.System.IsNotConfigured)
			: new OrganizationResponse
			{
				OrganizationName = organization.OrganizationName,
				BotName = organization.BotName,
				Direction = organization.Direction,
				Language = organization.Language,
			};
	}
}
