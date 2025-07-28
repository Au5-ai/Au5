using Au5.Application.Features.Org.Config;

namespace Au5.BackEnd.Controllers;

public class OrgController(ISender mediator) : BaseController
{
	/// <summary>
	/// Initializes the company configuration.
	/// </summary>
	/// <param name="command">The command containing the company configuration details.</param>
	/// <returns>A result indicating success or failure.</returns>
	[HttpPost("config")]
	public async Task<IActionResult> InitCompany([FromBody] ConfigOrganizationCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
