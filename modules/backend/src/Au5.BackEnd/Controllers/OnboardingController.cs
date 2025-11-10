using Au5.Application.Features.Setup.AddAdmin;
using Au5.Application.Features.Setup.HelloAdmin;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Route("onboarding")]
public class OnboardingController(ISender mediator) : BaseController
{
	[HttpGet("hello-admin")]
	[AllowAnonymous]
	public async Task<IActionResult> HelloAdmin()
	{
		return Ok(await mediator.Send(new HelloAdminQuery()));
	}

	[HttpPost("admin")]
	[AllowAnonymous]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CreateAdmin([FromBody] AddAdminCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
