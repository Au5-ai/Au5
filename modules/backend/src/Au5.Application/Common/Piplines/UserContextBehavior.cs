namespace Au5.Application.Common.Piplines;

/// <summary>
/// Pipeline behavior that automatically injects the current user's ID into requests that implement IUserContextRequest.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public class UserContextBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
	where TRequest : IRequest<TResponse>
{
	private readonly ICurrentUserService _currentUserService;

	public UserContextBehavior(ICurrentUserService currentUserService)
	{
		_currentUserService = currentUserService;
	}

	public async ValueTask<TResponse> Handle(TRequest message, MessageHandlerDelegate<TRequest, TResponse> next, CancellationToken cancellationToken)
	{
		if (message is IUserContextRequest userContextRequest)
		{
			if (!_currentUserService.IsAuthenticated)
			{
				throw new UnauthorizedAccessException("User is not authenticated.");
			}

			userContextRequest.UserId = _currentUserService.UserId;
		}

		return await next(message, cancellationToken);
	}
}
