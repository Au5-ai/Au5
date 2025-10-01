using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;

namespace Au5.Infrastructure.Adapters;

public class AIEngineAdapter : IAIEngineAdapter
{
	public async Task<string> CreateAssistantAsync(CreateAssistantRequest request, CancellationToken cancellationToken = default)
	{
		return await Task.Run(() => { return "asst_eF8RChuneG6GmgTCWaQSmUKC"; }, cancellationToken);
	}

	public Task<IAsyncEnumerable<string>> RunThreadAsync(RunThreadRequest request, CancellationToken cancellationToken = default)
	{
		throw new NotImplementedException();
	}
}
