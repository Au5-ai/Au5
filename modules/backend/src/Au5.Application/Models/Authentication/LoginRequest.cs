namespace Au5.Application.Models.Authentication;

public record LoginRequest
{
	public string Username { get; init; }

	public string Password { get; init; }
}
