using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;

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

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);
		return dbResult.IsSuccess ? Result.Success() : Error.Failure(description: AppResources.FailedToConfigCompany);
	}
}
