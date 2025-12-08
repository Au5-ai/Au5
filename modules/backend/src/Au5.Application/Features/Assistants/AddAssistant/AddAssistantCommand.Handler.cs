using Au5.Application.Common;
using Au5.Application.Dtos.AI;

namespace Au5.Application.Features.Assistants.AddAssistant;

public class AddAssistantCommandHandler(IApplicationDbContext dbContext, IAIClient aiClient, ICurrentUserService currentUserService, IDataProvider dataProvider) : IRequestHandler<AddAssistantCommand, Result<AddAssisstantResponse>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly IAIClient _aiClient = aiClient;
	private readonly ICurrentUserService _currentUserService = currentUserService;
	private readonly IDataProvider _dataProvider = dataProvider;

	public async ValueTask<Result<AddAssisstantResponse>> Handle(AddAssistantCommand request, CancellationToken cancellationToken)
	{
		var config = await _dbContext.Set<Organization>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure("Organization.NotConfigured", AppResources.Organization.IsNotConfigured);
		}

		var assistantId = await _aiClient.CreateAssistantAsync(
			new CreateAssistantRequest()
			{
				Instructions = request.Instructions,
				Model = request.LLMModel,
				Name = request.Name,
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
