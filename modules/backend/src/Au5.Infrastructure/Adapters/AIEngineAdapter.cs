using System.Text;
using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;
using Au5.Infrastructure.Common;
using Au5.Shared;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Adapters;

public class AIEngineAdapter(IHttpClientFactory httpClientFactory, ILogger<AIEngineAdapter> logger) : IAIEngineAdapter
{
	private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
	private readonly ILogger<AIEngineAdapter> _logger = logger;

	public async Task<string> CreateAssistantAsync(string baseUrl, CreateAssistantRequest request, CancellationToken cancellationToken = default)
	{
		var result = await PostJsonAsync(
			url: $"{baseUrl}/api/assistants",
			payload: request,
			failureMessage: AppResources.AIEngine.FailedToAdd,
			cancellationToken: cancellationToken);
		return result.IsSuccess ? result.Data : string.Empty;
	}

	public Task<IAsyncEnumerable<string>> RunThreadAsync(RunThreadRequest request, CancellationToken cancellationToken = default)
	{
		throw new NotImplementedException();
	}

	private async Task<Result<string>> PostJsonAsync<T>(
		string url,
		T payload,
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

			return await response.Content.ReadAsStringAsync(cancellationToken);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with AIEngineAdapter at {Url}", url);
			return Error.Failure(description: AppResources.AIEngine.FailedCommunicate);
		}
	}
}
