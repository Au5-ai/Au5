using Au5.BackEnd.Extensions;
using Au5.BackEnd.Filters;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Authorize]
[ApiController]
[ServiceFilter(typeof(ResultHandlingActionFilter))]
[Route("[controller]")]
public class BaseController : ControllerBase
{
	public Guid CurrentUserId
	{
		get
		{
			return User?.Identity?.IsAuthenticated != true
				? throw new UnauthorizedAccessException("User is not authenticated.")
				: User.ToParticipant().Id;
		}
	}
}
