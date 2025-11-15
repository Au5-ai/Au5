namespace Au5.Infrastructure.Authentication;

public class JwtSettings
{
	public string SecretKey { get; set; }

	public string Issuer { get; set; }

	public string Audience { get; set; }

	public int ExpiryMinutes { get; set; } = 15;

	public int RefreshTokenExpiryDays { get; set; } = 30;
}
