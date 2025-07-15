using Microsoft.AspNetCore.Diagnostics;

namespace Au5.BackEnd.GlobalHandler;

internal sealed class GlobalExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
	public async ValueTask<bool> TryHandleAsync(
		HttpContext httpContext,
		Exception exception,
		CancellationToken cancellationToken)
	{
		httpContext.Response.StatusCode = exception switch
		{
			ApplicationException => StatusCodes.Status400BadRequest,
			_ => StatusCodes.Status500InternalServerError
		};

		return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
		{
			HttpContext = httpContext,
			Exception = exception,
			ProblemDetails = new ProblemDetails
			{
				Type = exception.GetType().Name,
				Title = "An error occured",
				Detail = exception.Message
			}
		});
	}
}
