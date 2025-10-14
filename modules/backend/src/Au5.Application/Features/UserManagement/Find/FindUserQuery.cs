namespace Au5.Application.Features.UserManagement.Find;

public record FindUserQuery(string Query) : IRequest<IReadOnlyCollection<Participant>>;
