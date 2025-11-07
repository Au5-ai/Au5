using Au5.Application.Features.Spaces.CreateSpace;
using Au5.Application.Features.Spaces.GetSpaceMeetings;
using Au5.Application.Features.Spaces.GetSpaceMembers;
using Au5.Application.Features.Spaces.GetSpaces;
using Au5.Application.Features.Spaces.GetUserSpaces;

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

	[HttpGet]
	[Route("my-spaces")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetMySpaces(CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetUserSpacesQuery(), ct));
	}

	[HttpGet]
	[Route("{spaceId}/meetings")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetSpaceMeetings([FromRoute] Guid spaceId, CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetSpaceMeetingsQuery(spaceId), ct));
	}

	[HttpGet]
	[Route("{spaceId}/members")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetSpaceMembers([FromRoute] Guid spaceId, CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetSpaceMembersQuery(spaceId), ct));
	}
}
