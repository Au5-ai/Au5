using Au5.Application.Features.Assistants.AddAssistant;
using Au5.Application.Features.Assistants.GetAll;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class AssistantsController(IMediator mediator) : BaseController
{
	[HttpGet]
	[Route("")]
	[Authorize(Policy = AuthorizationPolicies.UserOrAdmin)]
	public async Task<IActionResult> GetAll([FromQuery] bool? isActive)
	{
		return Ok(await mediator.Send(new GetAssistantsQuery(isActive)));
	}

	[HttpPost]
	[Route("")]
	[Authorize(Policy = AuthorizationPolicies.UserOrAdmin)]
	public async Task<IActionResult> Add([FromBody] AddAssistantCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
