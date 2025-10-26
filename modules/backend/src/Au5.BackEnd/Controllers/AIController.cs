using Au5.Application.Features.AI.Delete;
using Au5.Application.Features.AI.Generate;

namespace Au5.BackEnd.Controllers
{
	public class AIController(ISender sender) : BaseController
	{
		[HttpPost("generate")]
		public async Task<IActionResult> GenerateAsync([FromBody] AIGenerateCommand request, CancellationToken cancellationToken = default)
		{
			Response.Headers.Append("Content-Type", "text/event-stream");
			Response.Headers.Append("Cache-Control", "no-cache");
			Response.Headers.Append("Connection", "keep-alive");

			await foreach (var message in sender.CreateStream(request, cancellationToken))
			{
				await Response.WriteAsync(message, cancellationToken);
				await Response.Body.FlushAsync(cancellationToken);
			}

			return new EmptyResult();
		}

		[HttpDelete("meetings/{meetingId}/sessions/{meetId}/ai-contents/{id}")]
		public async Task<IActionResult> DeleteAsync([FromRoute] Guid meetingId, [FromRoute] Guid id, CancellationToken cancellationToken = default)
		{
			var result = await sender.Send(new DeleteAIContentCommand(id, meetingId), cancellationToken);
			return Ok(result);
		}
	}
}
