using System.Security.Claims;
using Au5.Application.Interfaces;
using Au5.Application.Models;
using Au5.Application.Models.Authentication;
using Au5.BackEnd.Extensions;
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
			UserDto user = new()
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
		var username = User.ToUserDto();
		var role = User.FindFirst(ClaimTypes.Role)?.Value;
		return Ok(new
		{
			message = "JWT authentication successful!",
			user = username,
			role = role
		});
	}
}
