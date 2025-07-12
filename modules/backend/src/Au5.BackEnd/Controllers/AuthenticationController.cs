using System.Security.Claims;
using Au5.Application.Models.Authentication;
using Au5.BackEnd.Extensions;
using Au5.Domain.Common;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[ApiController]
[Route("authentication")]
public class AuthenticationController(ITokenService tokenService) : ControllerBase
{
	private readonly ITokenService _tokenService = tokenService;

	[HttpPost("login")]
	public IActionResult Login([FromBody] LoginRequestDto request)
	{
		// todo: Fake check – replace with real user validation
		if (request.Username == "admin" && request.Password == "admin")
		{
			Participant user = new()
			{
				Id = Guid.NewGuid(),
				FullName = "Admin User",
				PictureUrl = "https://example.com/admin.png",
			};
			var token = _tokenService.GenerateToken(user, "Admin");
			return Ok(new { token });
		}

		return Unauthorized();
	}

	[Authorize]
	[HttpGet("test-auth")]
	public IActionResult TestAuth()
	{
		var username = User.ToParticipant();
		var role = User.FindFirst(ClaimTypes.Role)?.Value;
		return Ok(new
		{
			message = "JWT authentication successful!",
			user = username,
			role = role
		});
	}
}
