namespace Au5.Application.Features.Setup.AddAdmin;

public record AddAdminCommand(string Email, string FullName, string Password, string RepeatedPassword) : IRequest<Result<AddAdminResponse>>;

public record AddAdminResponse
{
	public bool IsDone { get; init; }
}
