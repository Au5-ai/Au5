using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace Au5.BackEnd.GlobalHandler;

internal sealed class ValidationExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
	public async ValueTask<bool> TryHandleAsync(
		HttpContext httpContext,
		Exception exception,
		CancellationToken cancellationToken)
	{
		if (exception is not ValidationException validationException)
		{
			return false;
		}

		httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
		var context = new ProblemDetailsContext
		{
			HttpContext = httpContext,
			Exception = exception,
			ProblemDetails = new ProblemDetails
			{
				Detail = "One or more validation errors occurred",
				Status = StatusCodes.Status400BadRequest
			}
		};

		var errors = validationException.Errors
			.GroupBy(e => e.PropertyName)
			.ToDictionary(
				g => g.Key.ToLowerInvariant(),
				g => g.Select(e => e.ErrorMessage).ToArray());
		context.ProblemDetails.Extensions.Add("errors", errors);

		return await problemDetailsService.TryWriteAsync(context);
	}
}
