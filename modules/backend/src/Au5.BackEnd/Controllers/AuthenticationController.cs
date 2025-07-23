using Au5.Application.Features.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class AuthenticationController(ISender mediator) : BaseController
{
	[HttpPost("login")]
	[AllowAnonymous]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> Login([FromBody] LoginRequest requestModel, CancellationToken ct)
	{
		return Ok(await mediator.Send(requestModel, ct));
	}
}
