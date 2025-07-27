using Au5.Application.Common.Abstractions;
using Au5.Shared;

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
			var userId = context.User.FindFirst(ClaimConstants.UserId)?.Value;
			var jti = context.User.FindFirst(ClaimConstants.Jti)?.Value;

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
