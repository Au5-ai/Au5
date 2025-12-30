using BotFather.Api.Models;

namespace BotFather.Api;

public interface IContainerService
{
    Task<(bool Success, string Error)> CreateAndStartContainerAsync(BotPayload config);
    Task<(bool Success, string Error)> RemoveContainerAsync(string meetId, string hashToken);
}
