using Au5.Application.Services.Models;

namespace Au5.Application.Common.Abstractions;

public interface IBotFatherService
{
	Task<Result> CreateBotAsync(string baseUrl, BotPayload payload, CancellationToken cancellationToken);
}
