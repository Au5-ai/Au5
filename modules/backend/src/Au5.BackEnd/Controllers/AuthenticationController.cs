using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Authentication;
using Au5.Shared;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class AuthenticationController(ISender mediator, ITokenService tokenService) : BaseController
{
	[HttpPost("login")]
	[AllowAnonymous]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> Login([FromBody] LoginRequest requestModel, CancellationToken ct)
	{
		return Ok(await mediator.Send(requestModel, ct));
	}

	[HttpPost("logout")]
	public async Task<IActionResult> Logout()
	{
		var userId = User.FindFirst(ClaimConstants.UserId)?.Value;
		var jti = User.FindFirst(ClaimConstants.Jti)?.Value;
		var expUnix = long.Parse(User.FindFirst(ClaimConstants.Exp).Value);
		var expiry = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;

		await tokenService.BlacklistTokenAsync(userId, jti, expiry);

		return Ok("Logged out");
	}
}
