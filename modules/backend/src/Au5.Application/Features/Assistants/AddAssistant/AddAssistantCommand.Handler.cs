using Au5.Application.Common;
using Au5.Application.Common.Options;
using Au5.Application.Dtos.AI;
using Microsoft.Extensions.Options;

namespace Au5.Application.Features.Assistants.AddAssistant;

public class AddAssistantCommandHandler(IApplicationDbContext dbContext, IAIEngineAdapter aiEngine, ICurrentUserService currentUserService, IDataProvider dataProvider, IOptions<OrganizationOptions> options) : IRequestHandler<AddAssistantCommand, Result<AddAssisstantResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly IAIEngineAdapter _aiEngine = aiEngine;
	private readonly ICurrentUserService _currentUserService = currentUserService;
	private readonly IDataProvider _dataProvider = dataProvider;
	private readonly OrganizationOptions _organizationOptions = options.Value;

	public async ValueTask<Result<AddAssisstantResponse>> Handle(AddAssistantCommand request, CancellationToken cancellationToken)
	{
		var config = await _dbContext.Set<Organization>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure("Organization.NotConfigured", AppResources.System.IsNotConfigured);
		}

		var assistantId = await _aiEngine.CreateAssistantAsync(
			_organizationOptions.AIProviderUrl,
			new CreateAssistantRequest()
			{
				Instructions = request.Instructions,
				Model = request.LLMModel,
				ApiKey = _organizationOptions.OpenAIToken,
				ProxyUrl = _organizationOptions.OpenAIProxyUrl,
				Name = request.Name,
				Tools = []
			}, cancellationToken);

		if (string.IsNullOrEmpty(assistantId))
		{
			return Error.Failure("Assistant.FailedToCreate", AppResources.Assistant.OpenAIConnectionFailed);
		}

		var isDefault = _currentUserService.Role == RoleTypes.Admin;
		var entity = new Assistant
		{
			Id = _dataProvider.NewGuid(),
			Name = request.Name,
			Icon = request.Icon,
			Description = request.Description,
			Instructions = request.Instructions,
			LLMModel = request.LLMModel,
			IsDefault = isDefault,
			IsActive = true,
			CreatedAt = _dataProvider.UtcNow,
			UserId = _currentUserService.UserId,
			OrganizationId = _currentUserService.OrganizationId,
			OpenAIAssistantId = assistantId
		};

		_dbContext.Set<Assistant>().Add(entity);
		var response = await _dbContext.SaveChangesAsync(cancellationToken);

		return response.IsFailure ? Error.Failure("Assistant.FailedToSave", AppResources.DatabaseFailureMessage) : new AddAssisstantResponse(entity.Id);
	}
}
