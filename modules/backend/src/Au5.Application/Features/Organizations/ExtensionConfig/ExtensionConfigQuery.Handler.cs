using Au5.Application.Common;
using Au5.Application.Common.Options;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Organizations.ExtensionConfig;

public class ExtensionConfigQueryHandler : IRequestHandler<ExtensionConfigQuery, Result<ExtensionConfigResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly OrganizationOptions _organizationOptions;

	public ExtensionConfigQueryHandler(IApplicationDbContext dbContext, IOptions<OrganizationOptions> organizationOptions)
	{
		_dbContext = dbContext;
		_organizationOptions = organizationOptions.Value;
	}

	public async ValueTask<Result<ExtensionConfigResponse>> Handle(ExtensionConfigQuery _, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<Organization>().FirstOrDefaultAsync(cancellationToken);

		return existingConfig is null
			? Error.Failure(description: AppResources.System.IsNotConfigured)
			: new ExtensionConfigResponse()
			{
				BotName = existingConfig.BotName,
				Direction = existingConfig.Direction,
				Language = existingConfig.Language,
				HubUrl = _organizationOptions.HubUrl,
				ServiceBaseUrl = _organizationOptions.ServiceBaseUrl,
				PanelUrl = _organizationOptions.PanelUrl
			};
	}
}
