namespace Au5.Application.Features.UserManagement.Search;

public record SearchUserQuery(string Query) : IRequest<IReadOnlyCollection<Participant>>;
