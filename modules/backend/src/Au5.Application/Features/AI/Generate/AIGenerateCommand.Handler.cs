using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Au5.Application.Dtos.AI;

namespace Au5.Application.Features.AI.Generate;

public class AIGenerateCommandHandler : IStreamRequestHandler<AIGenerateCommand, string>
{
	private readonly IAIClient _aiClient;
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;
	private readonly IDataProvider _dataProvider;

	public AIGenerateCommandHandler(IAIClient aIClient, IApplicationDbContext dbContext, ICurrentUserService currentUserService, IDataProvider dataProvider)
	{
		_aiClient = aIClient;
		_dbContext = dbContext;
		_currentUserService = currentUserService;
		_dataProvider = dataProvider;
	}

	public async IAsyncEnumerable<string> Handle(
		AIGenerateCommand request,
		[EnumeratorCancellation] CancellationToken cancellationToken)
	{
		var aiContent = await _dbContext.Set<AIContents>()
			.AsNoTracking()
			.FirstOrDefaultAsync(x => x.MeetingId == request.MeetingId && x.AssistantId == request.AssistantId && x.IsActive, cancellationToken);

		if (aiContent is not null)
		{
			yield return JsonSerializer.Serialize(new { type = "cached", content = aiContent.Content }) + "\n\n";
			yield break;
		}

		var assistant = await _dbContext.Set<Assistant>()
			.AsNoTracking()
			.FirstOrDefaultAsync(x => x.Id == request.AssistantId && x.OrganizationId == _currentUserService.OrganizationId, cancellationToken);

		if (assistant is null)
		{
			yield return JsonSerializer.Serialize(new { type = "error", error = "Assistant not found." }) + "\n\n";
			yield break;
		}

		var meeting = await _dbContext.Set<Meeting>()
			.AsNoTracking()
			.Include(x => x.User)
			.Include(x => x.Guests)
			.Include(x => x.Participants)
				.ThenInclude(p => p.User)
			.Include(x => x.Entries)
				.ThenInclude(ent => ent.Reactions)
				.ThenInclude(rac => rac.Reaction)
			.FirstOrDefaultAsync(m => m.Id == request.MeetingId, cancellationToken);

		if (meeting is null)
		{
			yield return JsonSerializer.Serialize(new { type = "error", error = "Meeting not found." }) + "\n\n";
			yield break;
		}

		var contentBuilder = new StringBuilder();
		var isCompleted = false;

		var stream = await _aiClient.RunThreadAsync(
			new RunThreadRequest
			{
				AssistantId = assistant.OpenAIAssistantId,
				Messages = new[]
				{
					FormatTranscription(meeting)
				}
			}, cancellationToken);

		await foreach (var jsonChunk in stream.WithCancellation(cancellationToken))
		{
			if (string.IsNullOrWhiteSpace(jsonChunk))
			{
				continue;
			}

			var shouldYield = true;
			JsonDocument doc = null;

			try
			{
				doc = JsonDocument.Parse(jsonChunk);
				var root = doc.RootElement;

				if (root.TryGetProperty("type", out var typeProperty))
				{
					var type = typeProperty.GetString();

					if (type == "text" && root.TryGetProperty("text", out var textProperty))
					{
						var textChunk = textProperty.GetString();
						contentBuilder.Append(textChunk);
					}
					else if (type == "status" && root.TryGetProperty("status", out var statusProperty))
					{
						var status = statusProperty.GetString();
						if (status is "completed" or "failed" or "cancelled")
						{
							isCompleted = true;
						}
					}
				}
			}
			catch (JsonException)
			{
				shouldYield = false;
			}
			finally
			{
				doc?.Dispose();
			}

			if (shouldYield)
			{
				yield return jsonChunk;
			}

			if (isCompleted)
			{
				break;
			}
		}

		var finalContent = contentBuilder.ToString();
		if (!string.IsNullOrWhiteSpace(finalContent))
		{
			var aiContentNew = new AIContents
			{
				MeetingId = meeting.Id,
				AssistantId = assistant.Id,
				Content = finalContent,
				CompletionTokens = 0,
				PromptTokens = 0,
				TotalTokens = 0,
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
		var sb = new StringBuilder();
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
