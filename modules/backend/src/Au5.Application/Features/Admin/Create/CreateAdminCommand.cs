namespace Au5.Application.Features.Admin.Create;

public record CreateAdminCommand(string Email, string FullName, string Password, string RepeatedPassword, string OrganizationName) : IRequest<Result<CreateAdminResponse>>;

public record CreateAdminResponse
{
	public bool IsDone { get; init; }
}
