using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;
using Au5.Infrastructure.Common;
using Au5.Shared;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Adapters;

public class AIEngineAdapter : IAIEngineAdapter
{
	private readonly IHttpClientFactory _httpClientFactory;
	private readonly ILogger<AIEngineAdapter> _logger;

	public AIEngineAdapter(IHttpClientFactory httpClientFactory, ILogger<AIEngineAdapter> logger)
	{
		_httpClientFactory = httpClientFactory;
		_logger = logger;
	}

	public async Task<string> CreateAssistantAsync(string baseUrl, CreateAssistantRequest request, CancellationToken cancellationToken = default)
	{
		var result = await PostJsonAsync<CreateAssistantRequest, BaseAIResponse<CreateAssistantData>>(
			url: $"{baseUrl}/api/assistants",
			payload: request,
			failureMessage: AppResources.AIEngine.FailedToAdd,
			cancellationToken: cancellationToken);

		return result.IsSuccess ? result.Data.Data.AssistantId : string.Empty;
	}

	public async Task<IAsyncEnumerable<string>> RunThreadAsync(string baseUrl, RunThreadRequest request, CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(baseUrl))
		{
			throw new ArgumentException("baseUrl must be provided.");
		}

		var httpClient = _httpClientFactory.CreateClient();
		var url = $"{baseUrl}/api/threads/runs";
		var json = JsonSerializer.Serialize(request);
		var content = new StringContent(json, Encoding.UTF8, "application/json");

		var response = await httpClient.PostAsync(url, content, cancellationToken);
		if (!response.IsSuccessStatusCode)
		{
			var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
			_logger.LogError("AIEngine stream failed. Url: {Url}, StatusCode: {StatusCode}, Error: {Error}", url, response.StatusCode, errorContent);
			throw new OperationCanceledException($"AIEngine stream failed: {response.StatusCode}");
		}

		return StreamResponseAsync(response, cancellationToken);
	}

	private static async IAsyncEnumerable<string> StreamResponseAsync(HttpResponseMessage response, [EnumeratorCancellation] CancellationToken cancellationToken)
	{
		await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
		using var reader = new StreamReader(stream, Encoding.UTF8);
		var buffer = new StringBuilder();
		var readBuffer = new char[1024];
		int charsRead;
		var separator = "\n\n";
		while ((charsRead = await reader.ReadAsync(readBuffer, 0, readBuffer.Length)) > 0 && !cancellationToken.IsCancellationRequested)
		{
			buffer.Append(readBuffer, 0, charsRead);
			var bufStr = buffer.ToString();
			int sepIdx;
			while ((sepIdx = bufStr.IndexOf(separator, StringComparison.Ordinal)) >= 0)
			{
				var jsonChunk = bufStr[..sepIdx].Trim();
				if (!string.IsNullOrWhiteSpace(jsonChunk))
				{
					yield return jsonChunk + "\n\n";
				}

				bufStr = bufStr[(sepIdx + separator.Length)..];
			}

			buffer.Clear();
			buffer.Append(bufStr);
		}

		var last = buffer.ToString().Trim();
		if (!string.IsNullOrWhiteSpace(last))
		{
			yield return last + "\n\n";
		}
	}

	private async Task<Result<TResponse>> PostJsonAsync<TRequest, TResponse>(
		string url,
		TRequest payload,
		string failureMessage,
		CancellationToken cancellationToken)
	{
		var json = JsonSerializer.Serialize(payload);
		var content = new StringContent(json, Encoding.UTF8, "application/json");
		var httpClient = _httpClientFactory.CreateClient();

		try
		{
			httpClient.Timeout = TimeSpan.FromSeconds(60);
			var response = await httpClient.PostAsync(url, content, cancellationToken);

			if (!response.IsSuccessStatusCode)
			{
				var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
				_logger.LogError(
					"AIEngine request failed. Url: {Url}, StatusCode: {StatusCode}, Error: {Error}",
					url,
					response.StatusCode,
					errorContent);

				return Error.Failure(description: failureMessage);
			}

			return await response.Content.ReadFromJsonAsync<TResponse>(cancellationToken);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with AIEngineAdapter at {Url}", url);
			return Error.Failure(description: AppResources.AIEngine.FailedCommunicate);
		}
	}
}

public class BaseAIResponse<TResponse>
{
	[JsonPropertyName("status")]
	public int Status { get; init; }

	[JsonPropertyName("is_success")]
	public bool IsSuccess { get; init; }

	[JsonPropertyName("data")]
	public TResponse Data { get; init; }

	[JsonPropertyName("error")]
	public object Error { get; init; }
}

public class CreateAssistantData
{
	[JsonPropertyName("assistant_id")]
	public string AssistantId { get; init; }
}
