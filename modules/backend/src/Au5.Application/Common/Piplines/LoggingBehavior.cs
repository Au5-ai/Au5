using Microsoft.Extensions.Logging;

namespace Au5.Application.Common.Piplines;

public class LoggingBehavior<TRequest, TResponse>(ILogger<LoggingBehavior<TRequest, TResponse>> logger) : IPipelineBehavior<TRequest, TResponse>
	where TRequest : IRequest<TResponse>
{
	private static readonly Action<ILogger, string, TRequest, Exception> _logRequest =
		LoggerMessage.Define<string, TRequest>(LogLevel.Information, new EventId(1, nameof(TRequest)), "Handling {RequestName} with data: {@Request}");

	private readonly ILogger _logger = logger;

	public async ValueTask<TResponse> Handle(TRequest request, MessageHandlerDelegate<TRequest, TResponse> next, CancellationToken cancellationToken)
	{
		var requestName = typeof(TRequest).Name;

		_logRequest(_logger, requestName, request, null);
		var response = await next(request, cancellationToken);

		// _logResponse(_logger, requestName, response, null);
		return response;
	}
}
