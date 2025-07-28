using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Org.Config;

public class ConfigOrganizationCommandHandler : IRequestHandler<ConfigOrganizationCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;

	public ConfigOrganizationCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result> Handle(ConfigOrganizationCommand request, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);

		if (existingConfig is not null)
		{
			if (!request.ForceUpdate)
			{
				return Error.Failure(description: AppResources.OrganizationAlreadyConfigured);
			}

			existingConfig.Name = request.Name;
			existingConfig.BotName = request.BotName;
			existingConfig.HubUrl = request.HubUrl;
			existingConfig.Direction = request.Direction;
			existingConfig.Language = request.Language;
			existingConfig.ServiceBaseUrl = request.ServiceBaseUrl;
			existingConfig.PanelUrl = request.PanelUrl;
			existingConfig.OpenAIToken = request.OpenAIToken;
		}
		else
		{
			_dbContext.Set<Organization>().Add(new Organization()
			{
				Id = Guid.NewGuid(),
				Name = request.Name,
				BotName = request.BotName,
				HubUrl = request.HubUrl,
				Direction = request.Direction,
				Language = request.Language,
				ServiceBaseUrl = request.ServiceBaseUrl,
				PanelUrl = request.PanelUrl,
				OpenAIToken = request.OpenAIToken
			});
		}

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.FailedToConfigOrganization);
	}
}
