namespace Au5.Application.Common.Abstractions;

public interface ITokenService
{
	string GenerateToken(Guid extensionId, string fullName, string role);

	Task BlacklistTokenAsync(string userId, string jti, DateTime expiry);

	Task<bool> IsTokenBlacklistedAsync(string userId, string jti);
}
