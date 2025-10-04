namespace Au5.Application.Features.Assistants.GetAll;

public record GetAssistantsQuery(bool? IsActive) : IRequest<Result<IReadOnlyCollection<Assistant>>>;
