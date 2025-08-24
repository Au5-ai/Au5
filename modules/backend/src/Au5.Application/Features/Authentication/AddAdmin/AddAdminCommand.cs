namespace Au5.Application.Features.Authentication.AddAdmin;

public record AddAdminCommand(string Email, string FullName, string Password, string RepeatedPassowrd) : IRequest<Result<AddAdminResponse>>;

public record AddAdminResponse
{
	public bool IsDone { get; init; }
}
