using Au5.Application.Common;

namespace Au5.Application.Features.Organizations.SetConfig;

public class OrganizationCommandHandler : IRequestHandler<OrganizationCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUser;

	public OrganizationCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUser = currentUserService;
	}

	public async ValueTask<Result> Handle(OrganizationCommand request, CancellationToken cancellationToken)
	{
		var organization = await _dbContext.Set<Organization>()
			.FirstOrDefaultAsync(x => x.Id == _currentUser.OrganizationId, cancellationToken);

		if (organization is null)
		{
			return Error.Unauthorized("Organization.NotConfigured", AppResources.System.IsNotConfigured);
		}

		organization.OrganizationName = request.OrganizationName;
		organization.BotName = request.BotName;
		organization.Direction = request.Direction;
		organization.Language = request.Language;

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure("Organization.FailedToUpdate", AppResources.System.FailedToConfig);
	}
}
