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

	public async Task Invoke(HttpContext context, ITokenService tokenService, IProblemDetailsService problemDetailsService)
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
					await problemDetailsService.WriteAsync(
						new ProblemDetailsContext
						{
							HttpContext = context,
							ProblemDetails = new ProblemDetails
							{
								Status = StatusCodes.Status401Unauthorized,
								Title = "Unauthorized",
								Detail = "This token has been blacklisted.",
								Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
							}
						});

					return;
				}
			}
		}

		await _next(context);
	}
}
