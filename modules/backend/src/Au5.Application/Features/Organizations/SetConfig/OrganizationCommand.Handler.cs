using Au5.Application.Common;

namespace Au5.Application.Features.Organizations.SetConfig;

public class OrganizationCommandHandler : IRequestHandler<OrganizationCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;

	public OrganizationCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result> Handle(OrganizationCommand request, CancellationToken cancellationToken)
	{
		var organization = await _dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);
		if (organization is null)
		{
			return Error.Unauthorized(description: AppResources.System.IsNotConfigured);
		}

		organization.OrganizationName = request.OrganizationName;
		organization.BotName = request.BotName;
		organization.Direction = request.Direction;
		organization.Language = request.Language;

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.System.FailedToConfig);
	}
}
