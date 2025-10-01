using Au5.Application.Dtos.AI;

namespace Au5.Application.Common.Abstractions;

public interface IAIEngineAdapter
{
	/// <summary>
	/// Runs a thread with the given assistant and messages, optionally streaming results.
	/// </summary>
	/// <param name="request">Request model containing all parameters.</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>Async stream of string results.</returns>
	Task<IAsyncEnumerable<string>> RunThreadAsync(RunThreadRequest request, CancellationToken cancellationToken = default);

	/// <summary>
	/// Creates an assistant with the given parameters.
	/// </summary>
	/// <param name="baseUrl">base url of ai provider.</param>
	/// <param name="request">Request model containing all parameters.</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>Task with the result.</returns>
	Task<string> CreateAssistantAsync(string baseUrl, CreateAssistantRequest request, CancellationToken cancellationToken = default);
}
