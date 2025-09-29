using Au5.Application.Common;

namespace Au5.Application.Features.Assistants.AddAssistant;

public class AddAssistantCommandHandler(IApplicationDbContext dbContext) : IRequestHandler<AddAssistantCommand, Result<AddAssisstantResponse>>
{
	public async ValueTask<Result<AddAssisstantResponse>> Handle(AddAssistantCommand request, CancellationToken cancellationToken)
	{
		var entity = new Assistant
		{
			Id = Guid.NewGuid(),
			Name = request.Name,
			Icon = request.Icon,
			Description = request.Description,
			Prompt = request.Prompt,
			IsDefault = false,
			IsActive = true,
			CreatedAt = DateTime.UtcNow
		};

		dbContext.Set<Assistant>().Add(entity);
		var response = await dbContext.SaveChangesAsync(cancellationToken);

		if (response.IsFailure)
		{
			return Error.Failure(description: AppResources.DatabaseFailureMessage);
		}

		return new AddAssisstantResponse(entity.Id);
	}
}
