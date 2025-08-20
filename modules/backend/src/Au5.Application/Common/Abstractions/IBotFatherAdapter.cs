using Au5.Application.Services.Models;

namespace Au5.Application.Common.Abstractions;

public interface IBotFatherAdapter
{
	Task<Result<string>> CreateBotAsync(string baseUrl, BotPayload payload, CancellationToken cancellationToken);
}
