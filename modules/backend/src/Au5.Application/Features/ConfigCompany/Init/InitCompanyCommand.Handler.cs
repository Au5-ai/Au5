using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.ConfigCompany.Init;

public class InitCompanyCommandHandler : IRequestHandler<InitCompanyCommand, Result>
{
	private readonly IApplicationDbContext _dbContext;

	public InitCompanyCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result> Handle(InitCompanyCommand request, CancellationToken cancellationToken)
	{
		var existingConfig = await _dbContext.Set<Company>().FirstAsync(cancellationToken);

		if (existingConfig is not null)
		{
			if (!request.ForceUpdate)
			{
				return Error.Failure(description: AppResources.CompanyAlreadyConfigured);
			}

			existingConfig.Name = request.Name;
			existingConfig.BotName = request.BotName;
			existingConfig.HubUrl = request.HubUrl;
			existingConfig.Direction = request.Direction;
			existingConfig.Language = request.Language;
			existingConfig.ServiceBaseUrl = request.ServiceBaseUrl;
			existingConfig.PanelUrl = request.PanelUrl;
		}
		else
		{
			_dbContext.Set<Company>().Add(new Company()
			{
				Id = Guid.NewGuid(),
				Name = request.Name,
				BotName = request.BotName,
				HubUrl = request.HubUrl,
				Direction = request.Direction,
				Language = request.Language,
				ServiceBaseUrl = request.ServiceBaseUrl,
				PanelUrl = request.PanelUrl,
			});
		}

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.Failed_To_Config_Company);
	}
}
