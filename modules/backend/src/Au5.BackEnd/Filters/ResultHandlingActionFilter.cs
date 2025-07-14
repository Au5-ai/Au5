#nullable disable

using Au5.Shared;
using Microsoft.AspNetCore.Mvc.Filters;
using IResult = Au5.Shared.IResult;

namespace Au5.BackEnd.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class ResultHandlingActionFilterAttribute : Attribute, IAsyncActionFilter
{
	public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
	{
		var executedContext = await next();

		if (!ShouldProcessResult(executedContext.Result))
		{
			return;
		}

		var objectResult = (ObjectResult)executedContext.Result;

		if (objectResult.Value is IResult result)
		{
			executedContext.Result = result.IsSuccess
				? CreateSuccessResult(result)
				: CreateErrorResult(result);
		}
	}

	private static bool ShouldProcessResult(IActionResult result)
	{
		return result is ObjectResult { Value: not null } objectResult && objectResult.Value is IResult;
	}

	private static OkObjectResult CreateSuccessResult(IResult result)
		=> new(result.GetData());

	private static ObjectResult CreateErrorResult(IResult result)
	{
		var problemDetails = CreateProblemDetails(result.Error);
		return new ObjectResult(problemDetails) { StatusCode = problemDetails.Status };
	}

	private static ProblemDetails CreateProblemDetails(Error error)
	{
		var problemDetails = new ProblemDetails
		{
			Status = (int)error.Type,
			Type = error.Type.ToString(),
			Detail = GetDefaultDetailMessage(error.Type)
		};

		problemDetails.Extensions["errors"] = new List<object>
		{
			new { error.Code, error.Description }
		};

		return problemDetails;
	}

	private static string GetDefaultDetailMessage(ErrorType errorType)
	{
		return errorType switch
		{
			ErrorType.Validation => "One or more validation errors has occurred",
			ErrorType.NotFound => "Required Resource Not Found",
			ErrorType.Unauthorized => "Authentication is required or has failed",
			ErrorType.Forbidden => "You do not have permission to access this resource",
			ErrorType.Failure => "Server Error has occurred",
			_ => string.Empty
		};
	}
}