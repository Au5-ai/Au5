using Au5.Application.Features.AI.Generate;

namespace Au5.BackEnd.Controllers;

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
}
