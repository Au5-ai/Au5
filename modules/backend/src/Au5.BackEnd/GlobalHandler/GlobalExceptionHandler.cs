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
				Status = httpContext.Response.StatusCode,
				Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
				Title = "Internal Server Error",
#if DEBUG
				Detail = "An unexpected error occurred. Please try again later."
#else

				Detail = "An unexpected error occurred. Please try again later."
#endif
			}
		});
	}
}
