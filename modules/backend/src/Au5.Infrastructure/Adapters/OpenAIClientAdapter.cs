using System.Runtime.CompilerServices;
using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Assistants;

#pragma warning disable OPENAI001

namespace Au5.Infrastructure.Adapters;

public class OpenAIClientAdapter : IAIClient
{
	private readonly OpenAIClient _openAIClient;
	private readonly ILogger<OpenAIClientAdapter> _logger;

	public OpenAIClientAdapter(OpenAIClient openAIClient, ILogger<OpenAIClientAdapter> logger)
	{
		_openAIClient = openAIClient;
		_logger = logger;
	}

	public async Task<string> CreateAssistantAsync(CreateAssistantRequest request, CancellationToken cancellationToken = default)
	{
		var assistantClient = _openAIClient.GetAssistantClient();

		var assistantOptions = new AssistantCreationOptions
		{
			Name = request.Name,
			Instructions = request.Instructions
		};

		try
		{
			var assistant = await assistantClient.CreateAssistantAsync(request.Model, assistantOptions, cancellationToken);
			return assistant.Value.Id;
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error creating assistant");
			return string.Empty;
		}
	}

	public async Task<IAsyncEnumerable<string>> RunThreadAsync(RunThreadRequest request, CancellationToken cancellationToken = default)
	{
		var assistantClient = _openAIClient.GetAssistantClient();

		try
		{
			var threadOptions = new ThreadCreationOptions();
			foreach (var message in request.Messages)
			{
				threadOptions.InitialMessages.Add(new ThreadInitializationMessage(
					MessageRole.User,
					[MessageContent.FromText(message)]));
			}

			var threadResult = await assistantClient.CreateThreadAsync(threadOptions, cancellationToken);
			var threadId = threadResult.Value.Id;

			return StreamRunAsync(assistantClient, threadId, request.AssistantId, cancellationToken);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error running thread");
			return AsyncEnumerableEmpty();
		}
	}

	private static async IAsyncEnumerable<string> AsyncEnumerableEmpty()
	{
		await Task.CompletedTask;
		yield break;
	}

	private static async IAsyncEnumerable<string> StreamRunAsync(
		AssistantClient assistantClient,
		string threadId,
		string assistantId,
		[EnumeratorCancellation] CancellationToken cancellationToken)
	{
		await foreach (var update in assistantClient.CreateRunStreamingAsync(threadId, assistantId, new RunCreationOptions(), cancellationToken))
		{
			if (update is MessageContentUpdate contentUpdate)
			{
				var text = contentUpdate.Text;
				if (!string.IsNullOrEmpty(text))
				{
					var chunk = new
					{
						type = "text",
						text
					};
					yield return JsonSerializer.Serialize(chunk) + "\n\n";
				}
			}
			else if (update.UpdateKind is StreamingUpdateReason.RunCompleted or StreamingUpdateReason.RunFailed or StreamingUpdateReason.RunCancelled)
			{
				var statusChunk = new
				{
					type = "status",
					status = update.UpdateKind.ToString().Replace("Run", string.Empty).ToLowerInvariant()
				};
				yield return JsonSerializer.Serialize(statusChunk) + "\n\n";
				break;
			}
		}
	}
}
