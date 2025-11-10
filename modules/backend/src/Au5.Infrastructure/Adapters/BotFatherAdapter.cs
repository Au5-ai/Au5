using System.Text;
using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Services.Models;
using Au5.Infrastructure.Common;
using Au5.Shared;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Adapters;

public class BotFatherAdapter(IHttpClientFactory httpClientFactory, ILogger<BotFatherAdapter> logger) : IBotFatherAdapter
{
	private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
	private readonly ILogger<BotFatherAdapter> _logger = logger;

	public Task<Result<string>> CreateBotContainerAsync(
		string baseUrl,
		BotPayload payload,
		CancellationToken cancellationToken) =>
	PostJsonAsync(
		url: $"{baseUrl}/create-container",
		payload: payload,
		failureMessage: AppResources.BotFather.FailedToAdd,
		cancellationToken: cancellationToken);

	public Task<Result<string>> RemoveBotContainerAsync(
		string baseUrl,
		string meetId,
		string hashToken,
		CancellationToken cancellationToken) =>
	PostJsonAsync(
		url: $"{baseUrl}/remove-container",
		payload: new { MeetId = meetId, HashToken = hashToken },
		failureMessage: AppResources.BotFather.FailedToRemove,
		cancellationToken: cancellationToken);

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
					"BotFather request failed. Url: {Url}, StatusCode: {StatusCode}, Error: {Error}",
					url,
					response.StatusCode,
					errorContent);

				return Error.Failure(failureMessage);
			}

			return await response.Content.ReadAsStringAsync(cancellationToken);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with BotFather at {Url}", url);
			return Error.Failure(description: AppResources.BotFather.FailedCommunicateWithBotFather);
		}
	}
}
