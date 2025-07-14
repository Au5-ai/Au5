using System.Security.Claims;
using Au5.Application.Models.Authentication;
using Au5.BackEnd.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Route("authentication")]
public class AuthenticationController(IAuthenticationService authenticationService) : BaseController
{
	private readonly IAuthenticationService _authenticationService = authenticationService;

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequest requestModel, CancellationToken ct)
	{
		var result = await _authenticationService.LoginAsync(requestModel, ct);
		return new ObjectResult(result);
	}

	[Authorize]
	[HttpGet("test-auth")]
	public IActionResult TestAuth()
	{
		var participant = User.ToParticipant();
		var role = User.FindFirstValue(ClaimTypes.Role) ?? "Unknown";

		return Ok(new
		{
			message = "JWT authentication successful!",
			user = participant,
			role,
		});
	}
}
