using Au5.Application.Features.Org.Config;
using Au5.Application.Features.Org.GetConfig;

namespace Au5.BackEnd.Controllers;

public class OrgController(ISender mediator) : BaseController
{
	/// <summary>
	/// Initializes the company configuration.
	/// </summary>
	/// <param name="command">The command containing the company configuration details.</param>
	/// <returns>A result indicating success or failure.</returns>
	[HttpPost("config")]
	public async Task<IActionResult> InitConfig([FromBody] ConfigOrganizationCommand command)
	{
		return Ok(await mediator.Send(command));
	}

	[HttpGet("config")]
	public async Task<IActionResult> GetConfig()
	{
		return Ok(await mediator.Send(new ConfigOrganizationQuery()));
	}
}
