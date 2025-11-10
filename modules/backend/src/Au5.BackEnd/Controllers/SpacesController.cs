using Au5.Application.Dtos.MeetingDtos;
using Au5.Application.Features.MeetingSpaces.AddMeetingToSpace;
using Au5.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;
using Au5.Application.Features.Spaces.CreateSpace;
using Au5.Application.Features.Spaces.GetSpaceMeetings;
using Au5.Application.Features.Spaces.GetSpaceMembers;
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
	[ProducesResponseType(typeof(SpaceDto), StatusCodes.Status201Created)]
	public async Task<IActionResult> CreateSpace([FromBody] CreateSpaceCommand command, CancellationToken ct)
	{
		var result = await mediator.Send(command, ct);
		return CreatedAtAction(nameof(CreateSpace), new { id = result.Data.Id }, result);
	}

	[HttpGet]
	[Route("{spaceId}/meetings")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetSpaceMeetings([FromRoute] Guid spaceId, CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetSpaceMeetingsQuery(spaceId), ct));
	}

	[HttpPost]
	[Route("{spaceId}/meetings/{meetingId}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> AddMeetingToSpace([FromRoute] Guid meetingId, [FromRoute] Guid spaceId, CancellationToken ct)
	{
		var command = new AddMeetingToSpaceCommand(meetingId, spaceId);
		return Ok(await mediator.Send(command, ct));
	}

	[HttpDelete]
	[Route("{spaceId}/meetings/{meetingId}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> RemoveMeetingFromSpace([FromRoute] Guid meetingId, [FromRoute] Guid spaceId, CancellationToken ct)
	{
		var command = new RemoveMeetingFromSpaceCommand(meetingId, spaceId);
		return Ok(await mediator.Send(command, ct));
	}

	[HttpGet]
	[Route("{spaceId}/members")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status403Forbidden)]
	public async Task<IActionResult> GetSpaceMembers([FromRoute] Guid spaceId, CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetSpaceMembersQuery(spaceId), ct));
	}
}
