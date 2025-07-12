using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Au5.Application.Interfaces;
using Au5.Application.Models.Authentication;
using Au5.Domain.Common;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Au5.Infrastructure.Authentication;

public class TokenService : ITokenService
{
	private readonly JwtSettings jwt;

	public TokenService(IOptions<JwtSettings> jwtOptions)
	{
		jwt = jwtOptions.Value;
	}

	public string GenerateToken(Participant user, string role)
	{
		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
			new Claim(ClaimTypes.Name, user.FullName ?? string.Empty),
			new Claim(ClaimTypes.Role, role),
		};

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: jwt.Issuer,
			audience: jwt.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(jwt.ExpiryMinutes),
			signingCredentials: creds);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
