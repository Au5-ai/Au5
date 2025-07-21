using Au5.Application.Features.Authentication;

namespace Au5.BackEnd.Controllers;

[Route("authentication")]
public class AuthenticationController(ISender mediator) : BaseController
{
	[HttpPost("login")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> Login([FromBody] LoginRequest requestModel, CancellationToken ct)
	{
		return Ok(await mediator.Send(requestModel, ct));
	}
}
