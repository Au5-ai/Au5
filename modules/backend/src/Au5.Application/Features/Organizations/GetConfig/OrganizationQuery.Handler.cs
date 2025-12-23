using Au5.Application.Common;

namespace Au5.Application.Features.Organizations.GetConfig;

public class OrganizationQueryHandler : IRequestHandler<OrganizationQuery, Result<OrganizationResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUser;

	public OrganizationQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUser = currentUserService;
	}

	public async ValueTask<Result<OrganizationResponse>> Handle(OrganizationQuery _, CancellationToken cancellationToken)
	{
		var organization = await _dbContext.Set<Organization>()
			.FirstOrDefaultAsync(x => x.Id == _currentUser.OrganizationId, cancellationToken);

		return organization is null
			? Error.Failure("Organization.NotConfigured", AppResources.Organization.IsNotConfigured)
			: new OrganizationResponse
			{
				OrganizationName = organization.OrganizationName,
				BotName = organization.BotName,
				Direction = organization.Direction,
				Language = organization.Language,
			};
	}
}
