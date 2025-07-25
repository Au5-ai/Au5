using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Au5.Application.Common.Abstractions;

namespace Au5.BackEnd.Middlewares;

public class JwtBlacklistMiddleware
{
	private readonly RequestDelegate _next;

	public JwtBlacklistMiddleware(RequestDelegate next)
	{
		_next = next;
	}

	public async Task Invoke(HttpContext context, ITokenService tokenService)
	{
		if (context.User.Identity.IsAuthenticated)
		{
			var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var jti = context.User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

			if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(jti))
			{
				var isBlacklisted = await tokenService.IsTokenBlacklistedAsync(userId, jti);
				if (isBlacklisted)
				{
					context.Response.StatusCode = 401;
					return;
				}
			}
		}

		await _next(context);
	}
}
