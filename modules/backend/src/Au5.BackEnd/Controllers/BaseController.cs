using Au5.BackEnd.Models;
using ErrorOr;

namespace Au5.BackEnd.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult ApiResult<T>(ErrorOr<T> result)
    {
        return result.Match(
            data => Ok(ApiResponse<T>.Success(data)),
            errors => Problem<T>(errors));
    }

    protected IActionResult Problem<T>(List<Error> errors)
    {
        var messages = errors.Select(e => e.Description).ToList();
        var firstError = errors.First();

        var statusCode = firstError.Type switch
		{
			ErrorType.Validation
            or ErrorType.Failure
            or ErrorType.Unexpected => StatusCodes.Status400BadRequest,
			ErrorType.NotFound => StatusCodes.Status404NotFound,
			ErrorType.Conflict => StatusCodes.Status409Conflict,
			ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
			ErrorType.Forbidden => StatusCodes.Status403Forbidden,

			_ => StatusCodes.Status500InternalServerError,
		};

        var response = ApiResponse<T>.Failure([.. messages]);
        return StatusCode(statusCode, response);
    }
}
