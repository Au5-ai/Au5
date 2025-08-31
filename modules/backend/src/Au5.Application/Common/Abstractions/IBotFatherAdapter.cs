using Au5.Application.Services.Models;

namespace Au5.Application.Common.Abstractions;

public interface IBotFatherAdapter
{
	Task<Result<string>> CreateBotContainerAsync(string baseUrl, BotPayload payload, CancellationToken cancellationToken);

	Task<Result<string>> RemoveBotContainerAsync(string baseUrl, string meetId, string hashToken, CancellationToken cancellationToken);
}
