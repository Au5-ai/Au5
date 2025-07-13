// <copyright file="AuthenticationController.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

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
	public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authenticationService.LoginAsync(request).ConfigureAwait(false);
        return ApiResult(result);
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
