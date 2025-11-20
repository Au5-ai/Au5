using Au5.Application.Features.Admin.Create;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Route("admin")]
public class AdminController(ISender mediator) : BaseController
{
	[HttpPost("hello")]
	[AllowAnonymous]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
