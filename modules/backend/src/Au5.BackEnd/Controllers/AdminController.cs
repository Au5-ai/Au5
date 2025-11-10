using Au5.Application.Features.Admin.Create;
using Au5.Application.Features.Setup.HelloAdmin;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Route("admin")]
public class AdminController(ISender mediator) : BaseController
{
	[HttpGet("hello")]
	[AllowAnonymous]
	public async Task<IActionResult> HelloAdmin()
	{
		return Ok(await mediator.Send(new HelloAdminQuery()));
	}

	[HttpPost("hello")]
	[AllowAnonymous]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
