using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Authentication.Login;
using Au5.Domain.Common;
using Au5.Shared;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Au5.Infrastructure.Authentication;

public class TokenService : ITokenService
{
	private const string CacheBlackListPrefix = "jwt_bl_";
	private readonly ICacheProvider _cacheProvider;
	private readonly JwtSettings _jwt;
	private readonly IDataProvider _dataProvider;

	public TokenService(IOptions<JwtSettings> jwtOptions, ICacheProvider cacheProvider, IDataProvider dataProvider)
	{
		_jwt = jwtOptions.Value;
		_cacheProvider = cacheProvider;
		_dataProvider = dataProvider;
	}

	public TokenResponse GenerateToken(Guid extensionId, string fullName, RoleTypes role, Guid organizationId)
	{
		var jti = _dataProvider.NewGuid().ToString();

		var claims = new[]
		{
			new Claim(ClaimConstants.UserId, extensionId.ToString()),
			new Claim(ClaimConstants.Name, fullName ?? string.Empty),
			new Claim(ClaimConstants.Role, ((byte)role).ToString()),
			new Claim(ClaimConstants.OrganizationId, organizationId.ToString()),
			new Claim(ClaimConstants.Jti, jti)
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _jwt.Issuer,
			audience: _jwt.Audience,
			claims: claims,
			expires: _dataProvider.Now.AddMinutes(_jwt.ExpiryMinutes),
			signingCredentials: creds);

		return new TokenResponse(new JwtSecurityTokenHandler().WriteToken(token), _jwt.ExpiryMinutes * 60, string.Empty, "Bearer");
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
		var ttl = expiry - _dataProvider.Now;

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
