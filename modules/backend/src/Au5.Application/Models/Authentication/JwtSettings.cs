namespace Au5.Application.Models.Authentication;

public class JwtSettings
{
	public string SecretKey { get; set; }

	public string Issuer { get; set; }

	public string Audience { get; set; }

	public int ExpiryMinutes { get; set; }
}
