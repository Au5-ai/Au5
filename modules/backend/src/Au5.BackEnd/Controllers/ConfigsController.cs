using Au5.Application.Features.SystemConfigs.ExtensionConfig;
using Au5.Application.Features.SystemConfigs.GetConfig;
using Au5.Application.Features.SystemConfigs.SetConfig;

namespace Au5.BackEnd.Controllers;

[Route("configs")]
public class ConfigsController(ISender mediator) : BaseController
{
	[HttpPost("system")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> UpdateSystemConfig([FromBody] SystemConfigCommand command)
	{
		return Ok(await mediator.Send(command));
	}

	[HttpGet("system")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetSystemConfig()
	{
		return Ok(await mediator.Send(new SystemConfigQuery()));
	}

	[HttpGet("extension")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetExtensionConfig()
	{
		return Ok(await mediator.Send(new ExtensionConfigQuery()));
	}
}
