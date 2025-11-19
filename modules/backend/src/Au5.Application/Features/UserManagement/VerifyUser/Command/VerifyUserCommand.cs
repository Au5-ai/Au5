namespace Au5.Application.Features.UserManagement.VerifyUser.Command;

public record VerifyUserCommand(Guid UserId, Guid OrganizationId, string HashedEmail, string FullName, string Password, string RepeatedPassword) : IRequest<Result<VerifyUserResponse>>;

public record VerifyUserResponse
{
	public bool IsDone { get; init; }
}
