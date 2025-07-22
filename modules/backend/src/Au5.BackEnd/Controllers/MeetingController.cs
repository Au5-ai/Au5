using Au5.Application.Features.Meetings.AddBot;
using Au5.Application.Features.Meetings.GetFullTranscription;

namespace Au5.BackEnd.Controllers;

public class MeetingController(ISender mediator) : BaseController
{
	[HttpGet("{meetId}/transcription")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> Transcripitons([FromRoute] string meetId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new GetFullTranscriptionQuery(meetId), cancellationToken));
	}

	[HttpPost("{meetId}/addBot")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> AddBot([FromRoute] string meetId, [FromBody] AddBotRequest request, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(request with { MeetId = meetId }, cancellationToken));
	}
}
