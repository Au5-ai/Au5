
using System.Runtime.CompilerServices;
using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;

namespace Au5.Application.Features.AI.Generate;


public class AIGenerateCommandHandler : IStreamRequestHandler<AIGenerateCommand, string>
{
	private readonly IAIEngineAdapter _aiEngineAdapter;
	private readonly IApplicationDbContext _dbContext;

	public AIGenerateCommandHandler(IAIEngineAdapter aiEngineAdapter, IApplicationDbContext dbContext)
	{
		_aiEngineAdapter = aiEngineAdapter;
		_dbContext = dbContext;
	}

	public async IAsyncEnumerable<string> Handle(
		AIGenerateCommand request,
		[EnumeratorCancellation] CancellationToken cancellationToken)
	{
		var aiContent = _dbContext.Set<AIContents>()
			.FirstOrDefault(x => x.MeetingId == request.MeetingId && x.AssistantId == request.AssistantId);
		if (aiContent != null)
		{
			yield return JsonSerializer.Serialize(new { content = aiContent.Content, tokens = new { aiContent.CompletionTokens, aiContent.PromptTokens, aiContent.TotalTokens } }) + "\n\n";
			yield break;
		}

		var meeting = _dbContext.Set<Meeting>().FirstOrDefault(x => x.Id == request.MeetingId || x.MeetId == request.MeetId);
		var assistant = _dbContext.Set<Assistant>().FirstOrDefault(x => x.Id == request.AssistantId);
		var config = _dbContext.Set<SystemConfig>().FirstOrDefault();

		if (meeting == null || assistant == null || config == null)
		{
			yield return JsonSerializer.Serialize(new { error = "Meeting, Assistant, or Config not found." }) + "\n\n";
			yield break;
		}

		var runThreadRequest = new RunThreadRequest
		{
			AssistantId = assistant.OpenAIAssistantId,
			Messages = new[] { ("user", JsonSerializer.Serialize(meeting)) },
			ApiKey = config.OpenAIToken,
			ProxyUrl = config.OpenAIProxyUrl,
			Stream = true
		};

		string finalContent = null;
		int completionTokens = 0, promptTokens = 0, totalTokens = 0;

		var stream = await _aiEngineAdapter.RunThreadAsync(config.AIProviderUrl, runThreadRequest, cancellationToken);
		await foreach (var jsonChunk in stream.WithCancellation(cancellationToken))
		{
			if (!string.IsNullOrWhiteSpace(jsonChunk))
			{
				try
				{
					using var doc = JsonDocument.Parse(jsonChunk);
					var root = doc.RootElement;
					var eventType = root.GetProperty("event").GetString();
					if (eventType == "thread.message.completed")
					{
						var data = root.GetProperty("data");
						var contentArr = data.GetProperty("content");
						if (contentArr.GetArrayLength() > 0)
						{
							var text = contentArr[0].GetProperty("text").GetProperty("value").GetString();
							finalContent = text;
						}
					}
					else if (eventType == "thread.run.step.completed")
					{
						var data = root.GetProperty("data");
						if (data.TryGetProperty("usage", out var usage))
						{
							completionTokens = usage.GetProperty("completion_tokens").GetInt32();
							promptTokens = usage.GetProperty("prompt_tokens").GetInt32();
							totalTokens = usage.GetProperty("total_tokens").GetInt32();
						}
					}
				}
				catch
				{
				}

				yield return jsonChunk;
			}
		}

		if (!string.IsNullOrWhiteSpace(finalContent))
		{
			var aiContentNew = new AIContents
			{
				MeetingId = meeting.Id,
				AssistantId = assistant.Id,
				Content = finalContent,
				CompletionTokens = completionTokens,
				PromptTokens = promptTokens,
				TotalTokens = totalTokens,
				CreatedAt = DateTime.UtcNow,
				UserId = meeting.ClosedMeetingUserId
			};
			_dbContext.Set<AIContents>().Add(aiContentNew);
			await _dbContext.SaveChangesAsync(cancellationToken);
		}
	}
}
