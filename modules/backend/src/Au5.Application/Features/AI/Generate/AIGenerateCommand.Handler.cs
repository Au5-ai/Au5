using System.Runtime.CompilerServices;
using System.Text.Json;
using Au5.Application.Dtos.AI;

namespace Au5.Application.Features.AI.Generate;

public class AIGenerateCommandHandler : IStreamRequestHandler<AIGenerateCommand, string>
{
	private readonly IAIEngineAdapter _aiEngineAdapter;
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;
	private readonly IDataProvider _dataProvider;

	public AIGenerateCommandHandler(IAIEngineAdapter aiEngineAdapter, IApplicationDbContext dbContext, ICurrentUserService currentUserService, IDataProvider dataProvider)
	{
		_aiEngineAdapter = aiEngineAdapter;
		_dbContext = dbContext;
		_currentUserService = currentUserService;
		_dataProvider = dataProvider;
	}

	public async IAsyncEnumerable<string> Handle(
		AIGenerateCommand request,
		[EnumeratorCancellation] CancellationToken cancellationToken)
	{
		var aiContent = await _dbContext.Set<AIContents>()
			.FirstOrDefaultAsync(x => x.MeetingId == request.MeetingId && x.AssistantId == request.AssistantId && x.IsActive, cancellationToken);

		if (aiContent is not null)
		{
			yield return JsonSerializer.Serialize(new { content = aiContent.Content }) + "\n\n";
			yield break;
		}

		var assistant = _dbContext.Set<Assistant>().FirstOrDefault(x => x.Id == request.AssistantId);
		var config = _dbContext.Set<SystemConfig>().FirstOrDefault();

		if (assistant is null || config is null)
		{
			yield return JsonSerializer.Serialize(new { error = "Meeting, Assistant, or Config not found." }) + "\n\n";
			yield break;
		}

		var meeting = await _dbContext.Set<Meeting>()
			.Include(x => x.User)
			.Include(x => x.Guests)
			.Include(x => x.Participants)
				.ThenInclude(p => p.User)
			.Include(x => x.Entries)
				.ThenInclude(ent => ent.Reactions)
				.ThenInclude(rac => rac.Reaction)
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId && m.MeetId == request.MeetId, cancellationToken);

		if (meeting is null)
		{
			yield return JsonSerializer.Serialize(new { error = "No meeting with this ID was found." }) + "\n\n";
			yield break;
		}

		var runThreadRequest = new RunThreadRequest
		{
			AssistantId = assistant.OpenAIAssistantId,
			Thread = new Dtos.AI.Thread()
			{
				Messages = new[]
				{
					new ThreadMessage()
					{
						Role = "user",
						Content = FormatTranscription(meeting)
					}
				}
			},
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
				CreatedAt = _dataProvider.Now,
				UserId = _currentUserService.UserId,
				IsActive = true,
			};
			_dbContext.Set<AIContents>().Add(aiContentNew);
			await _dbContext.SaveChangesAsync(cancellationToken);
		}
	}

	private static string FormatTranscription(Meeting meeting)
	{
		var sb = new System.Text.StringBuilder();
		var orderedEntries = meeting.Entries.OrderBy(e => e.Timestamp);

		foreach (var entry in orderedEntries)
		{
			sb.AppendLine($"[Speaker: {entry.FullName ?? "Unknown"}]");
			sb.AppendLine(entry.Content);

			if (entry.Reactions != null && entry.Reactions.Count != 0)
			{
				var reactions = entry.Reactions
					.Select(r => $"{r.Reaction.Emoji} {r.Reaction.Type} from {string.Join(", ", r.Participants.Select(x => x.FullName))}");
				sb.AppendLine($"(Reactions: {string.Join(", ", reactions)})");
			}

			sb.AppendLine();
		}

		return sb.ToString();
	}
}
