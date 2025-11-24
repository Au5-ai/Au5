namespace Au5.Domain.Entities;

[Entity]
public class BlacklistedToken
{
	public Guid Id { get; set; }

	public string UserId { get; set; }

	public string Jti { get; set; }

	public DateTime ExpiresAt { get; set; }

	public DateTime BlacklistedAt { get; set; }
}
