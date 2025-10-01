using Au5.Application.Common;
using Au5.Application.Dtos.AI;

namespace Au5.Application.Features.Assistants.AddAssistant;

public class AddAssistantCommandHandler(IApplicationDbContext dbContext, IAIEngineAdapter aiEngine, ICurrentUserService currentUserService) : IRequestHandler<AddAssistantCommand, Result<AddAssisstantResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly IAIEngineAdapter _aiEngine = aiEngine;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<AddAssisstantResponse>> Handle(AddAssistantCommand request, CancellationToken cancellationToken)
	{
		var config = await _dbContext.Set<SystemConfig>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		var assistantId = await _aiEngine.CreateAssistantAsync(
			config.AIProviderUrl,
			new CreateAssistantRequest()
			{
				Instructions = request.Instructions,
				Model = "gpt-4o",
				ApiKey = config.OpenAIToken,
				ProxyUrl = config.OpenAIProxyUrl,
				Name = request.Name,
				Tools = []
			}, cancellationToken);

		if (string.IsNullOrEmpty(assistantId))
		{
			return Error.Failure(AppResources.Assistant.Code, AppResources.Assistant.OpenAIConnectionFailed);
		}

		var isDefault = _currentUserService.Role == RoleTypes.Admin;
		var entity = new Assistant
		{
			Id = Guid.NewGuid(),
			Name = request.Name,
			Icon = request.Icon,
			Description = request.Description,
			Instructions = request.Instructions,
			IsDefault = isDefault,
			IsActive = true,
			CreatedAt = DateTime.UtcNow,
			UserId = _currentUserService.UserId,
			OpenAIAssistantId = assistantId
		};

		_dbContext.Set<Assistant>().Add(entity);
		var response = await _dbContext.SaveChangesAsync(cancellationToken);

		return response.IsFailure ? Error.Failure(description: AppResources.DatabaseFailureMessage) : new AddAssisstantResponse(entity.Id);
	}
}
