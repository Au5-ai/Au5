using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Au5.Application.Common.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Au5.Infrastructure.Authentication;

public class TokenService : ITokenService
{
	private const string CacheBlackListPrefix = "jwt_bl_";
	private readonly ICacheProvider _cacheProvider;
	private readonly JwtSettings _jwt;

	public TokenService(IOptions<JwtSettings> jwtOptions, ICacheProvider cacheProvider)
	{
		_jwt = jwtOptions.Value;
		_cacheProvider = cacheProvider;
	}

	public string GenerateToken(Guid extensionId, string fullName, string role)
	{
		var jti = Guid.NewGuid().ToString();

		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, extensionId.ToString()),
			new Claim(ClaimTypes.Name, fullName ?? string.Empty),
			new Claim(ClaimTypes.Role, role),
			new Claim(JwtRegisteredClaimNames.Jti, jti)
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _jwt.Issuer,
			audience: _jwt.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
			signingCredentials: creds);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

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
		return $"{CacheBlackListPrefix}{userId}_{jti}";
	}
}
