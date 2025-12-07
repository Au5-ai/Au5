namespace Au5.Application.Features.UserManagement.InviteUsers;

public record InviteUsersCommand(List<InviteUsersRequest> Invites) : IRequest<Result<InviteUsersResponse>>;

public record InviteUsersRequest
{
	public string Email { get; init; }

	public RoleTypes Role { get; init; }
}

public class InviteUsersResponse
{
	required public IReadOnlyCollection<string> Success { get; init; }

	required public IReadOnlyDictionary<string, string> Failed { get; init; }
}
