using System.Security.Claims;
using Au5.Application.Interfaces;
using Au5.Application.Models.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Au5.BackEnd.Controllers;

[ApiController]
[Route("authentication")]
public class AuthenticationController : ControllerBase
{
	private readonly ITokenService _tokenService;

	public AuthenticationController(ITokenService tokenService)
	{
		_tokenService = tokenService;
	}

	[HttpPost("login")]
	public IActionResult Login([FromBody] LoginRequestDto request)
	{
		// todo: Fake check – replace with real user validation
		if (request.Username == "admin" && request.Password == "admin")
		{
			var token = _tokenService.GenerateToken(request.Username, "Admin");
			return Ok(new { token });
		}

		return Unauthorized();
	}

	[Authorize]
	[HttpGet("test-auth")]
	public IActionResult TestAuth()
	{
		var username = User.Identity?.Name;
		var role = User.FindFirst(ClaimTypes.Role)?.Value;
		return Ok(new
		{
			message = "JWT authentication successful!",
			user = username,
			role = role
		});
	}
}
