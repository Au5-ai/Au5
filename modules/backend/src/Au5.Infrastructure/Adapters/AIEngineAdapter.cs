using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Adapters;

public class AIEngineAdapter : IAIEngineAdapter
{
	private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
	{
		WriteIndented = false,
		DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
	};

	private readonly IHttpClientFactory _httpClientFactory;
	private readonly ILogger<AIEngineAdapter> _logger;

	public AIEngineAdapter(IHttpClientFactory httpClientFactory, ILogger<AIEngineAdapter> logger)
	{
		_httpClientFactory = httpClientFactory;
		_logger = logger;
	}

	public async Task<string> CreateAssistantAsync(string baseUrl, CreateAssistantRequest request, CancellationToken cancellationToken = default)
	{
		var url = $"{baseUrl}/api/assistants";
		var assistantId = await PostJsonAsync(url, request, cancellationToken);
		return assistantId;
	}

	public async Task<IAsyncEnumerable<string>> RunThreadAsync(string baseUrl, RunThreadRequest request, CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(baseUrl))
		{
			throw new ArgumentException("Base URL must be provided.", nameof(baseUrl));
		}

		var url = $"{baseUrl}/api/threads/runs";
		var httpClient = _httpClientFactory.CreateClient();
		using var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");

		var response = await httpClient.PostAsync(url, content, cancellationToken);

		if (!response.IsSuccessStatusCode)
		{
			var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
			_logger.LogError("AIEngine stream failed: {StatusCode} - {Error}", response.StatusCode, errorContent);
			throw new HttpRequestException($"AIEngine stream failed: {response.StatusCode}");
		}

		return StreamResponseAsync(response, cancellationToken);
	}

	private static async IAsyncEnumerable<string> StreamResponseAsync(HttpResponseMessage response, [EnumeratorCancellation] CancellationToken cancellationToken)
	{
		await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
		using var reader = new StreamReader(stream, Encoding.UTF8);

		var buffer = new StringBuilder();
		var readBuffer = new char[1024];
		const string separator = "\n\n";

		while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
		{
			var charsRead = await reader.ReadAsync(readBuffer, 0, readBuffer.Length);
			if (charsRead <= 0)
			{
				continue;
			}

			buffer.Append(readBuffer, 0, charsRead);
			var bufStr = buffer.ToString();

			int sepIdx;
			while ((sepIdx = bufStr.IndexOf(separator, StringComparison.Ordinal)) >= 0)
			{
				var chunk = bufStr[..sepIdx].Trim();
				if (!string.IsNullOrWhiteSpace(chunk))
				{
					yield return chunk + separator;
				}

				bufStr = bufStr[(sepIdx + separator.Length)..];
			}

			buffer.Clear();
			buffer.Append(bufStr);
		}

		var last = buffer.ToString().Trim();
		if (!string.IsNullOrWhiteSpace(last))
		{
			yield return last + separator;
		}
	}

	private async Task<string> PostJsonAsync<TRequest>(
		string url,
		TRequest payload,
		CancellationToken cancellationToken)
	{
		var httpClient = _httpClientFactory.CreateClient();
		httpClient.Timeout = TimeSpan.FromSeconds(60);

		try
		{
			using var content = new StringContent(JsonSerializer.Serialize(payload, JsonOptions), Encoding.UTF8, "application/json");
			var response = await httpClient.PostAsync(url, content, cancellationToken);

			if (!response.IsSuccessStatusCode)
			{
				var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
				_logger.LogError("AIEngine request failed: {StatusCode} - {Error}", response.StatusCode, errorContent);
				return string.Empty;
			}

			var result = await response.Content.ReadFromJsonAsync<BaseAIResponse<CreateAssistantData>>(JsonOptions, cancellationToken);
			return result is null
				? string.Empty
				: result.Data.AssistantId;
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with AIEngine at {Url}", url);
			return string.Empty;
		}
	}
}

internal class BaseAIResponse<TResponse>
{
	[JsonPropertyName("data")]
	public TResponse Data { get; init; }
}

internal class CreateAssistantData
{
	[JsonPropertyName("assistant_id")]
	public string AssistantId { get; init; }
}
