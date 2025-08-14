using Au5.Application.Features.SystemConfigs.GetConfig;
using Au5.Application.Features.SystemConfigs.SetConfig;

namespace Au5.BackEnd.Controllers;

public class SystemController(ISender mediator) : BaseController
{
	/// <summary>
	/// Initializes the company configuration.
	/// </summary>
	/// <param name="command">The command containing the company configuration details.</param>
	/// <returns>A result indicating success or failure.</returns>
	[HttpPost("config")]
	public async Task<IActionResult> InitConfig([FromBody] SystemConfigCommand command)
	{
		return Ok(await mediator.Send(command));
	}

	[HttpGet("config")]
	public async Task<IActionResult> GetConfig()
	{
		return Ok(await mediator.Send(new SystemConfigQuery()));
	}
}
