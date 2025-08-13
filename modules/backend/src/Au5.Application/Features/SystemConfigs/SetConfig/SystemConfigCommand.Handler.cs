using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.SystemConfigs.SetConfig;

public class SystemConfigCommandHandler : IRequestHandler<SystemConfigCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;

	public SystemConfigCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result> Handle(SystemConfigCommand request, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<SystemConfig>().FirstOrDefaultAsync(cancellationToken);

		if (existingConfig is not null)
		{
			if (!request.ForceUpdate)
			{
				return Error.Failure(description: AppResources.SystemAlreadyConfigured);
			}

			existingConfig.OrganizationName = request.OrganizationName;
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
			_dbContext.Set<SystemConfig>().Add(new SystemConfig()
			{
				Id = Guid.NewGuid(),
				OrganizationName = request.OrganizationName,
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
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.FailedToConfigSystem);
	}
}
