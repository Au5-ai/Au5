using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Authentication.Login;
using Au5.Shared;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class AuthenticationController(ISender mediator, ITokenService tokenService) : BaseController
{
	[HttpPost("login")]
	[AllowAnonymous]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> Login([FromBody] LoginCommand requestModel, CancellationToken ct)
	{
		return Ok(await mediator.Send(requestModel, ct));
	}

	[HttpPost("logout")]
	[Authorize(Policy = AuthorizationPolicies.UserOrAdmin)]
	public async Task<IActionResult> Logout()
	{
		var userId = User.FindFirst(ClaimConstants.UserId)?.Value;
		var jti = User.FindFirst(ClaimConstants.Jti)?.Value;
		var expClaim = User.FindFirst(ClaimConstants.Exp)?.Value;

		if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(jti) || string.IsNullOrEmpty(expClaim) || !long.TryParse(expClaim, out var expUnix))
		{
			return BadRequest(new ProblemDetails
			{
				Title = "Invalid token",
				Status = StatusCodes.Status400BadRequest,
				Detail = "The access token is invalid or improperly formatted.",
				Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
			});
		}

		var expiry = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
		await tokenService.BlacklistTokenAsync(userId, jti, expiry);

		return Ok(new { message = "Logged out successfully" });
	}
}
