namespace Au5.Application.Features.UserManagement.ToggleStatus;

public record ToggleUserStatusCommand(string UserId, bool IsValid) : IRequest<User>;
