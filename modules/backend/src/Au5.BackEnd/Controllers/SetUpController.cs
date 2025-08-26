using Au5.Application.Features.Setup.AddAdmin;
using Au5.Application.Features.Setup.HelloAdmin;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class SetUpController(ISender mediator) : BaseController
{
	[HttpGet("hello-admin")]
	[AllowAnonymous]
	public async Task<IActionResult> HelloAdmin()
	{
		return Ok(await mediator.Send(new HelloAdminQuery()));
	}

	[HttpPost("hello-admin")]
	[AllowAnonymous]
	public async Task<IActionResult> AddAdmin([FromBody] AddAdminCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
