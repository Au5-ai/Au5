namespace Au5.Application.Features.UserManagement.InviteUsers;

public record InviteUsersCommand(List<InviteUsersRequest> Invites) : IRequest<Result<InviteUsersResponse>>;

public record InviteUsersRequest
{
	public string Email { get; init; }

	public RoleTypes Role { get; init; }
}

public class InviteUsersResponse
{
	required public IReadOnlyCollection<InvitationResult> Results { get; init; }
}

public class InvitationResult
{
	required public string Email { get; init; }

	public bool StoredInDatabase { get; init; }

	public bool EmailSent { get; init; }

	public bool AlreadyExists { get; init; }

	public string ErrorMessage { get; init; }
}
