namespace Au5.Application.Common.Piplines;

public class ValidatorBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators) : IPipelineBehavior<TRequest, TResponse>
	where TRequest : IRequest<TResponse>
{
	private readonly IEnumerable<IValidator<TRequest>> _validators = validators;

	public async ValueTask<TResponse> Handle(TRequest message, CancellationToken cancellationToken, MessageHandlerDelegate<TRequest, TResponse> next)
	{
		var validations = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(message)));

		var errors = validations.Where(x => !x.IsValid)
		  .SelectMany(result => result.Errors)
		  .Select(x => new ValidationFailure(x.PropertyName, x.ErrorMessage))
		  .ToList();

		return errors.Count != 0
			? throw new ValidationException($"Command Validation Errors for type {typeof(TRequest).Name}", errors)
			: await next(message, cancellationToken);
	}
}
