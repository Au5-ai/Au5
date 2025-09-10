namespace Au5.Application.Features.UserManagement.ToggleStatus;

public record ToggleUserStatusCommand(Guid UserId, bool IsValid) : IRequest<User>;
