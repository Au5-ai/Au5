namespace Au5.Application.Models.Authentication;

public class JwtSettings
{
	public string SecretKey { get; set; } = default!;

	public string Issuer { get; set; } = default!;

	public string Audience { get; set; } = default!;

	public int ExpiryMinutes { get; set; }
}
