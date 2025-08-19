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

	public async Task<Result<string>> CreateBotAsync(string baseUrl, BotPayload payload, CancellationToken cancellationToken)
	{
		var url = baseUrl + "/create-container";
		var json = JsonSerializer.Serialize(payload);
		var content = new StringContent(json, Encoding.UTF8, "application/json");

		var httpClient = _httpClientFactory.CreateClient();

		try
		{
			var response = await httpClient.PostAsync(url, content, cancellationToken);
			if (!response.IsSuccessStatusCode)
			{
				var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
				_logger.LogError("Failed to create bot: {Error}", errorContent);
				return Error.Failure(description: AppResources.FailedToAddBot);
			}

			return await response.Content.ReadAsStringAsync(cancellationToken);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with BotFather.");
			return Error.Failure(description: AppResources.FailedCommunicateWithBotFather);
		}
	}
}
