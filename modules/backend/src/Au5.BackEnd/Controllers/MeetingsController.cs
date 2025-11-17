using Au5.Application.Features.AI.Delete;
using Au5.Application.Features.AI.Generate;
using Au5.Application.Features.AI.GetAll;
using Au5.Application.Features.Meetings.CloseMeetingByUser;
using Au5.Application.Features.Meetings.Export;
using Au5.Application.Features.Meetings.GetFullTranscription;
using Au5.Application.Features.Meetings.PublicUrl;
using Au5.Application.Features.Meetings.Rename;
using Au5.Application.Features.Meetings.ToggleArchive;
using Au5.Application.Features.Meetings.ToggleFavorite;

namespace Au5.BackEnd.Controllers;

public class MeetingsController(ISender mediator) : BaseController
{
	[HttpGet("{meetingId}/transcript")]
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

	[HttpPost("{meetingId}/ai-contents")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> CreateAIContent([FromRoute] Guid meetingId, [FromBody] AIGenerateCommand request, CancellationToken cancellationToken)
	{
		Response.Headers.Append("Content-Type", "text/event-stream");
		Response.Headers.Append("Cache-Control", "no-cache");
		Response.Headers.Append("Connection", "keep-alive");

		await foreach (var message in mediator.CreateStream(request with { MeetingId = meetingId }, cancellationToken))
		{
			await Response.WriteAsync(message, cancellationToken);
			await Response.Body.FlushAsync(cancellationToken);
		}

		return new EmptyResult();
	}

	[HttpPost("{meetingId}/rename")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> RenameMeeting([FromRoute] Guid meetingId, [FromBody] RenameMeetingCommand command, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(command with { MeetingId = meetingId }, cancellationToken));
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
		var result = await mediator.Send(new ExportQuery(meetingId, format), cancellationToken);

		return result.IsSuccess
			? Content(result.Data!, "text/plain", System.Text.Encoding.UTF8)
			: BadRequest(result.Error);
	}

	[HttpPost("{meetingId}/public-link")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetSystemMeetingUrl([FromRoute] Guid meetingId, [FromBody] PublicMeetingUrlCommand command, CancellationToken cancellationToken)
	{
		return Ok(await mediator.Send(command with { MeetingId = meetingId }, cancellationToken));
	}
}

public record AddBotRequest(string Platform, string BotName);
