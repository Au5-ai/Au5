using Au5.Application.Common;
using Au5.Application.Dtos.AI;

namespace Au5.Application.Features.Assistants.AddAssistant;

public class AddAssistantCommandHandler(IApplicationDbContext dbContext, IAIEngineAdapter aIEngine, ICurrentUserService currentUserService) : IRequestHandler<AddAssistantCommand, Result<AddAssisstantResponse>>
{
	public async ValueTask<Result<AddAssisstantResponse>> Handle(AddAssistantCommand request, CancellationToken cancellationToken)
	{
		var assistantId = await aIEngine.CreateAssistantAsync(
			new CreateAssistantRequest()
			{
				Instructions = request.Instructions,
				Model = "gpt-4o",
				ApiKey = "afd",
				ProxyUrl = "adf",
				Name = request.Name,
				Tools = []
			}, cancellationToken);

		if (string.IsNullOrEmpty(assistantId))
		{
			return Error.Failure(AppResources.Assistant.Code, AppResources.Assistant.OpenAIConnectionFailed);
		}

		var isDefault = currentUserService.Role == RoleTypes.Admin;
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
			UserId = currentUserService.UserId,
			OpenAIAssistantId = assistantId
		};

		dbContext.Set<Assistant>().Add(entity);
		var response = await dbContext.SaveChangesAsync(cancellationToken);

		return response.IsFailure ? (Result<AddAssisstantResponse>)Error.Failure(description: AppResources.DatabaseFailureMessage) : (Result<AddAssisstantResponse>)new AddAssisstantResponse(entity.Id);
	}
}
