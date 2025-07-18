namespace Au5.BackEnd.Controllers;

public class MeetingController(IMeetingService meetingService) : BaseController
{
	private readonly IMeetingService _meetingService = meetingService;

	[HttpGet("/{meetingId}/transcription")]
	public async Task<IActionResult> Transcripitons([FromRoute] string meetingId, CancellationToken ct)
	{
		return Ok(await _meetingService.GetFullTranscriptionAsJson(meetingId, ct));
	}
}
