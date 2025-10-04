using Au5.Application.Features.Spaces.CreateSpace;
using Au5.Application.Features.Spaces.GetSpaces;

namespace Au5.BackEnd.Controllers;

public class SpacesController(ISender mediator) : BaseController
{
	[HttpGet]
	[Route("")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetSpaces(CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetSpacesQuery(), ct));
	}

	[HttpPost]
	[Route("")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CreateSpace([FromBody] CreateSpaceCommand command, CancellationToken ct)
	{
		return Ok(await mediator.Send(command, ct));
	}
}
