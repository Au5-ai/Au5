using System.Text;
using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;
using Au5.Application.Services.Models;
using Microsoft.Extensions.Logging;

namespace Au5.Application.Services;

public class BotFatherService(IHttpClientFactory httpClientFactory, ILogger<BotFatherService> logger) : IBotFatherService
{
	private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
	private readonly ILogger<BotFatherService> _logger = logger;

	public async Task<Result> CreateBotAsync(string baseUrl, BotPayload payload, CancellationToken cancellationToken)
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

			return Result.Success();
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "Error communicating with BotFather.");
			return Error.Failure(description: AppResources.FailedCommunicateWithBotFather);
		}
	}
}
