namespace Au5.Application.Common.Abstractions;

public interface IJwtBlacklistService
{
	Task BlacklistTokenAsync(string userId, string jti, DateTime expiry);

	Task<bool> IsTokenBlacklistedAsync(string userId, string jti);
}
