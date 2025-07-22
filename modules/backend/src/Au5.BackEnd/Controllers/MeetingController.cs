using Au5.Application.Features.Meetings.GetFullTranscription;

namespace Au5.BackEnd.Controllers;

public class MeetingController(ISender mediator) : BaseController
{
	[HttpGet("{meetingId}/transcription")]
	public async Task<IActionResult> Transcripitons([FromRoute] string meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new GetFullTranscriptionQuery(meetingId), cancellationToken));
	}
}
