using System.Text;
using System.Security.Claims;
using Au5.Application.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Au5.Application.Models.Authentication;

namespace Au5.Infrastructure.Authentication;

public class TokenService : ITokenService
{
	private readonly JwtSettings _jwt;

	public TokenService(IOptions<JwtSettings> jwtOptions)
	{
		_jwt = jwtOptions.Value;
	}

	public string GenerateToken(string username, string role)
	{
		var claims = new[]
		{
			new Claim(ClaimTypes.Name, username),
			new Claim(ClaimTypes.Role, role),
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _jwt.Issuer,
			audience: _jwt.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
			signingCredentials: creds
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
