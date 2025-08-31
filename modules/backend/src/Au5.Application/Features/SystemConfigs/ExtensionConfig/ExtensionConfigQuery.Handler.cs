using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.SystemConfigs.ExtensionConfig;

public class ExtensionConfigQueryHandler : IRequestHandler<ExtensionConfigQuery, Result<ExtensionConfigResponse>>
{
	private readonly IApplicationDbContext _dbContext;

	public ExtensionConfigQueryHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<ExtensionConfigResponse>> Handle(ExtensionConfigQuery _, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<SystemConfig>().FirstOrDefaultAsync(cancellationToken);

		if (existingConfig is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		return new ExtensionConfigResponse()
		{
			BotName = existingConfig.BotName,
			Direction = existingConfig.Direction,
			Language = existingConfig.Language,
			HubUrl = existingConfig.HubUrl,
			ServiceBaseUrl = existingConfig.ServiceBaseUrl,
			PanelUrl = existingConfig.PanelUrl
		};
	}
}
