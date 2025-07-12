using System.Security.Claims;
using Au5.Application.Models.Authentication;
using Au5.BackEnd.Extensions;
using Au5.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Au5.BackEnd.Controllers;

[ApiController]
[Route("authentication")]
public class AuthenticationController(ITokenService tokenService) : ControllerBase
{
	private readonly ITokenService _tokenService = tokenService;

	[HttpPost("login")]
	public IActionResult Login([FromBody] LoginRequestDto request)
	{
		// TODO: Replace with real user validation (e.g., from database or identity provider)
		const string demoUsername = "admin";
		const string demoPassword = "admin";

		if (request.Username == demoUsername && request.Password == demoPassword)
		{
			var user = new Participant
			{
				Id = Guid.NewGuid(),
				FullName = "Mohammad Karimi",
				PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
			};

			var token = _tokenService.GenerateToken(user, "Admin");

			return Ok(new { token });
		}

		return Unauthorized(new { message = "Invalid username or password" });
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
			role
		});
	}
}
