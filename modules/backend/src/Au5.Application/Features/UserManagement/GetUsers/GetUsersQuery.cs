namespace Au5.Application.Features.UserManagement.GetUsers;

public record GetUsersQuery : IRequest<IReadOnlyCollection<User>>;
