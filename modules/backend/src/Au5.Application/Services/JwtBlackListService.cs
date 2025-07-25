using Au5.Application.Common.Abstractions;

namespace Au5.Application.Services;

public class JwtBlacklistService(ICacheProvider cacheProvider) : IJwtBlacklistService
{
	private const string CachePrefix = "jwt:blacklist:";
	private readonly ICacheProvider _cacheProvider = cacheProvider;

	public async Task BlacklistTokenAsync(string userId, string jti, DateTime expiry)
	{
		if (string.IsNullOrWhiteSpace(userId))
		{
			throw new ArgumentNullException(nameof(userId));
		}

		if (string.IsNullOrWhiteSpace(jti))
		{
			throw new ArgumentNullException(nameof(jti));
		}

		var key = BuildKey(userId, jti);
		var ttl = expiry - DateTime.UtcNow;

		if (ttl <= TimeSpan.Zero)
		{
			return; // Don't store if already expired
		}

		await _cacheProvider.SetAsync(key, true, ttl);
	}

	public async Task<bool> IsTokenBlacklistedAsync(string userId, string jti)
	{
		if (string.IsNullOrWhiteSpace(userId))
		{
			return false;
		}

		if (string.IsNullOrWhiteSpace(jti))
		{
			return false;
		}

		var key = BuildKey(userId, jti);
		return await _cacheProvider.ExistsAsync(key);
	}

	private static string BuildKey(string userId, string jti)
	{
		return $"{CachePrefix}{userId}:{jti}";
	}
}
