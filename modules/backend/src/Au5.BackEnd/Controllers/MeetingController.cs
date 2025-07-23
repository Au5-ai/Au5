using Au5.Application.Features.Meetings.AddBot;
using Au5.Application.Features.Meetings.GetFullTranscription;

namespace Au5.BackEnd.Controllers;

public class MeetingController(ISender mediator) : BaseController
{
	[HttpGet("{meetingId}/{meetId}/transcription")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> Transcripitons([FromRoute] Guid meetingId, [FromRoute] string meetId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new GetFullTranscriptionQuery(meetingId, meetId), cancellationToken));
	}

	[HttpPost("addBot")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> AddBot([FromBody] AddBotCommand request, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(request, cancellationToken));
	}
}
