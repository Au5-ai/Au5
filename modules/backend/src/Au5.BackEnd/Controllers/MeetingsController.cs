using Au5.Application.Features.Meetings.AddBot;
using Au5.Application.Features.Meetings.CloseMeetingByUser;
using Au5.Application.Features.Meetings.GetFullTranscription;
using Au5.Application.Features.Meetings.MyMeeting;
using Au5.Application.Features.Meetings.ToggleFavorite;
using Au5.Domain.Common;

namespace Au5.BackEnd.Controllers;

public class MeetingsController(ISender mediator) : BaseController
{
	[HttpGet("{meetingId}/sessions/{meetId}/transcription")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetTranscriptions([FromRoute] Guid meetingId, [FromRoute] string meetId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new GetFullTranscriptionQuery(meetingId, meetId), cancellationToken));
	}

	/// <summary>
	/// Get my meetings	GET	/users/me/meetings?status=ended
	/// Get archived meetings	GET	/users/me/meetings?status=archived.
	/// </summary>
	/// <param name="status">The status of the meetings to retrieve.</param>
	/// <param name="cancellationToken">A token to cancel the operation.</param>
	/// <returns>The list of meetings matching the specified status.</returns>
	[HttpGet("my")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> MyMeetings([FromQuery] string status, CancellationToken cancellationToken)
	{
		var meetingStatus = MeetingStatus.Ended;
		if (status.Equals("archived", StringComparison.OrdinalIgnoreCase))
		{
			meetingStatus = MeetingStatus.Archived;
		}

		return Ok(await mediator.Send(new MyMeetingQuery(meetingStatus), cancellationToken));
	}

	[HttpPost("{meetingId}/sessions/{meetId}/actions/addBot")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> AddBotToMeeting([FromBody] AddBotCommand request, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(request, cancellationToken));
	}

	[HttpPost("{meetingId}/sessions/{meetId}/actions/close")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CloseMeeting([FromRoute] Guid meetingId, [FromRoute] string meetId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new CloseMeetingByUserCommand(meetingId, meetId), cancellationToken));
	}

	[HttpPost("{meetingId}/sessions/{meetId}/toggle-favorite")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> ToggleFavorite([FromRoute] Guid meetingId, [FromRoute] string meetId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new ToggleFavoriteCommand(meetingId, meetId), cancellationToken));
	}
}
