using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Au5.Application.Common.Abstractions;
using Au5.Application.Models.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Au5.Infrastructure.Authentication;

public class TokenService : ITokenService
{
	private readonly JwtSettings _jwt;

	public TokenService(IOptions<JwtSettings> jwtOptions)
	{
		_jwt = jwtOptions.Value;
	}

	public string GenerateToken(Guid extensionId, string fullName, string role)
	{
		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, extensionId.ToString()),
			new Claim(ClaimTypes.Name, fullName ?? string.Empty),
			new Claim(ClaimTypes.Role, role),
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
}
