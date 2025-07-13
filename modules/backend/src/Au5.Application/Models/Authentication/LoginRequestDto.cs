namespace Au5.Application.Models.Authentication;

public record LoginRequestDto
{
	public string Username { get; init; }

	public string Password { get; init; }
}