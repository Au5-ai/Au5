using Au5.Application.Features.AI.Delete;
using Au5.Application.Features.AI.GetAll;
using Au5.Application.Features.Meetings.CloseMeetingByUser;
using Au5.Application.Features.Meetings.ExportToText;
using Au5.Application.Features.Meetings.GetFullTranscription;
using Au5.Application.Features.Meetings.MyMeeting;
using Au5.Application.Features.Meetings.ToggleArchive;
using Au5.Application.Features.Meetings.ToggleFavorite;
using Au5.Application.Features.MeetingSpaces.AddMeetingToSpace;
using Au5.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;
using Au5.Application.Features.Spaces.GetSpaceMeetings;
using Au5.Domain.Common;

namespace Au5.BackEnd.Controllers;

public class MeetingsController(ISender mediator) : BaseController
{
	[HttpGet("{meetingId}/transcription")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetTranscriptions([FromRoute] Guid meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new GetFullTranscriptionQuery(meetingId), cancellationToken));
	}

	[HttpGet("{meetingId}/ai-contents")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetAllAIContentsAsync([FromRoute] Guid meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new GetAIContentsQuery(meetingId), cancellationToken));
	}

	[HttpDelete("{meetingId}/ai-contents/{id}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> DeleteAsync([FromRoute] Guid meetingId, [FromRoute] Guid id, CancellationToken cancellationToken = default)
	{
		var result = await mediator.Send(new DeleteAIContentCommand(id, meetingId), cancellationToken);
		return Ok(result);
	}

	[HttpPost("bots")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> AddBotToMeeting([FromBody] AddBotRequest request, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(request, cancellationToken));
	}

	[HttpPost("{meetingId}/close")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CloseMeeting([FromRoute] Guid meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new CloseMeetingByUserCommand(meetingId), cancellationToken));
	}

	[HttpPut("{meetingId}/favorite")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> ToggleFavorite([FromRoute] Guid meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new ToggleFavoriteCommand(meetingId), cancellationToken));
	}

	[HttpPost("{meetingId}/archive")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> ArchiveMeeting([FromRoute] Guid meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new ToggleArchiveCommand(meetingId), cancellationToken));
	}

	[HttpPost("{meetingId}/unarchive")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> UnarchiveMeeting([FromRoute] Guid meetingId, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(new ToggleArchiveCommand(meetingId), cancellationToken));
	}

	[HttpGet("{meetingId}/export")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> ExportMeeting([FromRoute] Guid meetingId, [FromQuery] string format, CancellationToken cancellationToken)
	{
		if (!string.Equals(format, "text", StringComparison.OrdinalIgnoreCase))
		{
			return BadRequest(new ProblemDetails
			{
				Title = "Invalid format",
				Status = StatusCodes.Status400BadRequest,
				Detail = "Only 'text' format is currently supported.",
				Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
			});
		}

		var result = await mediator.Send(new ExportToTextQuery(meetingId), cancellationToken);

		return result.IsSuccess
			? Content(result.Data!, "text/plain", System.Text.Encoding.UTF8)
			: BadRequest(result.Error);
	}
}

public record AddBotRequest(string Platform, string BotName);
