// <copyright file="AuthenticationController.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using System.Security.Claims;
using Au5.Application.Models.Authentication;
using Au5.BackEnd.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[ApiController]
[Route("authentication")]
public class AuthenticationController(IAuthenticationService authenticationService) : ControllerBase
{
	private readonly IAuthenticationService _authenticationService = authenticationService;

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var loginResult = await _authenticationService.LoginAsync(request).ConfigureAwait(false);
        return loginResult.IsError ? Unauthorized(loginResult) : Ok(loginResult);
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
