using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Authentication.Login;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Au5.Infrastructure.Authentication;

public class TokenService : ITokenService
{
	private readonly JwtSettings _jwt;
	private readonly IDataProvider _dataProvider;
	private readonly IApplicationDbContext _dbContext;

	public TokenService(IOptions<JwtSettings> jwtOptions, IDataProvider dataProvider, IApplicationDbContext dbContext)
	{
		_jwt = jwtOptions.Value;
		_dataProvider = dataProvider;
		_dbContext = dbContext;
	}

	public TokenResponse GenerateToken(Guid extensionId, string fullName, RoleTypes role, Guid organizationId)
	{
		var jti = _dataProvider.NewGuid().ToString();

		var claims = new[]
		{
			new Claim(ClaimConstants.UserId, extensionId.ToString()),
			new Claim(ClaimConstants.Name, fullName ?? string.Empty),
			new Claim(ClaimConstants.Role, role.ToString()),
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

		if (expiry <= _dataProvider.Now)
		{
			return;
		}

		var exists = await _dbContext.Set<BlacklistedToken>()
			.AnyAsync(x => x.UserId == userId && x.Jti == jti);

		if (exists)
		{
			return;
		}

		var blacklistedToken = new BlacklistedToken
		{
			Id = _dataProvider.NewGuid(),
			UserId = userId,
			Jti = jti,
			ExpiresAt = expiry,
			BlacklistedAt = _dataProvider.Now
		};

		_dbContext.Set<BlacklistedToken>().Add(blacklistedToken);
		await _dbContext.SaveChangesAsync(CancellationToken.None);
	}

	public async Task<bool> IsTokenBlacklistedAsync(string userId, string jti)
	{
		if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(jti))
		{
			return false;
		}

		return await _dbContext.Set<BlacklistedToken>()
			.AnyAsync(x => x.UserId == userId && x.Jti == jti && x.ExpiresAt > _dataProvider.Now);
	}
}
