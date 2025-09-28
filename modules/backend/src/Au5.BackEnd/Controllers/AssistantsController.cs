using Au5.Application.Features.Assistants.AddAssistant;
using Au5.Application.Features.Assistants.GetAll;

namespace Au5.BackEnd.Controllers;

public class AssistantsController(IMediator mediator) : BaseController
{
	[HttpGet]
	[Route("")]
	public async Task<IActionResult> GetAll([FromQuery] bool? isActive)
	{
		return Ok(await mediator.Send(new GetAssistantsQuery(isActive)));
	}

	[HttpPost]
	[Route("")]
	public async Task<IActionResult> Add([FromBody] AddAssistantCommand command)
	{
		return Ok(await mediator.Send(command));
	}
}
