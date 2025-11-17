using Au5.Application.Common;
using Au5.Application.Common.Options;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Organizations.ExtensionConfig;

public class ExtensionConfigQueryHandler : IRequestHandler<ExtensionConfigQuery, Result<ExtensionConfigResponse>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUser;
	private readonly OrganizationOptions _organizationOptions;

	public ExtensionConfigQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService, IOptions<OrganizationOptions> organizationOptions)
	{
		_dbContext = dbContext;
		_currentUser = currentUserService;
		_organizationOptions = organizationOptions.Value;
	}

	public async ValueTask<Result<ExtensionConfigResponse>> Handle(ExtensionConfigQuery _, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<Organization>().FirstOrDefaultAsync(x => x.Id == _currentUser.OrganizationId, cancellationToken);

		if (existingConfig is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		var currentUser = await _dbContext.Set<User>().AsNoTracking().Select(x => new Participant()
		{
			Id = x.Id,
			Email = x.Email,
			FullName = x.FullName,
			PictureUrl = x.PictureUrl
		}).FirstOrDefaultAsync(x => x.Id == _currentUser.UserId, cancellationToken);

		if (currentUser is null)
		{
			return Error.Unauthorized(description: AppResources.User.UserNotFound);
		}

		return new ExtensionConfigResponse()
		{
			Service = new Service()
			{
				Direction = existingConfig.Direction,
				Language = existingConfig.Language,
				HubUrl = _organizationOptions.HubUrl,
				ServiceBaseUrl = _organizationOptions.ServiceBaseUrl,
				PanelUrl = _organizationOptions.PanelUrl
			},
			User = currentUser
		};
	}
}
