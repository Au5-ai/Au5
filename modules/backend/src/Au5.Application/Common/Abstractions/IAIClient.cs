using Au5.Application.Dtos.AI;

namespace Au5.Application.Common.Abstractions;

public interface IAIClient
{
	Task<IAsyncEnumerable<string>> RunThreadAsync(RunThreadRequest request, CancellationToken cancellationToken = default);

	Task<string> CreateAssistantAsync(CreateAssistantRequest request, CancellationToken cancellationToken = default);
}
