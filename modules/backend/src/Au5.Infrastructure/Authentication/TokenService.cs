using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

		var signingKeyBytes = Convert.FromBase64String(_jwt.SecretKey);
		var signingKey = new SymmetricSecurityKey(signingKeyBytes);
		var signingCreds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

		var encryptionKeyBytes = Convert.FromBase64String(_jwt.EncryptionKey);
		var encryptionKey = new SymmetricSecurityKey(encryptionKeyBytes);
		var encryptingCreds = new EncryptingCredentials(
			encryptionKey,
			SecurityAlgorithms.Aes256KW,
			SecurityAlgorithms.Aes128CbcHmacSha256);

		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Expires = _dataProvider.Now.AddMinutes(_jwt.ExpiryMinutes),
			Issuer = _jwt.Issuer,
			Audience = _jwt.Audience,
			SigningCredentials = signingCreds,
			EncryptingCredentials = encryptingCreds
		};

		var tokenHandler = new JwtSecurityTokenHandler();
		var token = tokenHandler.CreateToken(tokenDescriptor);
		var tokenString = tokenHandler.WriteToken(token);

		return new TokenResponse(tokenString, _jwt.ExpiryMinutes * 60, string.Empty, "Bearer");
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
		return !string.IsNullOrWhiteSpace(userId) &&
			   !string.IsNullOrWhiteSpace(jti) &&
			   await _dbContext.Set<BlacklistedToken>()
				   .AnyAsync(x => x.UserId == userId && x.Jti == jti && x.ExpiresAt > _dataProvider.Now);
	}
}
