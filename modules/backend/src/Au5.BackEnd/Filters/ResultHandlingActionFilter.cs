using Microsoft.AspNetCore.Mvc.Filters;
using IResult = Au5.Shared.IResult;

namespace Au5.BackEnd.Filters;

public sealed class ResultHandlingActionFilter : IAsyncActionFilter
{
	private readonly IProblemDetailsService _problemDetailsService;

	public ResultHandlingActionFilter(IProblemDetailsService problemDetailsService)
	{
		_problemDetailsService = problemDetailsService;
	}

	public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
	{
		var executedContext = await next();

		if (executedContext.Result is not ObjectResult { Value: IResult result })
		{
			return;
		}

		if (result.IsSuccess)
		{
			executedContext.Result = new OkObjectResult(result.GetData());
		}
		else
		{
			var httpContext = context.HttpContext;
			httpContext.Response.StatusCode = (int)result.Error.Type;

			var error = result.Error!;

			var problemDetails = new ProblemDetails
			{
				Type = $"https://tools.ietf.org/html/rfc9110#section-15.5.1",
				Title = error.Code,
				Status = (int)error.Type,
				Detail = error.Description,
			};

			await _problemDetailsService.WriteAsync(new ProblemDetailsContext
			{
				HttpContext = httpContext,
				ProblemDetails = problemDetails
			});

			executedContext.Result = new EmptyResult();
		}
	}
}
