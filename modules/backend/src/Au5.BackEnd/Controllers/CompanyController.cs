using Au5.Application.Features.ConfigCompany.Init;

namespace Au5.BackEnd.Controllers;

public class CompanyController(ISender mediator) : BaseController
{
	/// <summary>
	/// Initializes the company configuration.
	/// </summary>
	/// <param name="command">The command containing the company configuration details.</param>
	/// <returns>A result indicating success or failure.</returns>
	[HttpPost("init")]
	public async Task<IActionResult> InitCompany([FromBody] InitCompanyCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
