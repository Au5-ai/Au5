using Au5.Application.Features.Reactions.GetAllReactionsQuery;
using Mediator;

namespace Au5.BackEnd.Controllers;

[ApiController]
[Route("[controller]")]
public class ReactionsController(ISender mediator) : ControllerBase
{
	[HttpGet]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async ValueTask<IActionResult> GetAll(CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetAllReactionsQuery(), ct));
	}
}
