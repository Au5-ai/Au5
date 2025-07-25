using Au5.BackEnd.Filters;

namespace Au5.BackEnd.Controllers;

[ApiController]
[ServiceFilter(typeof(ResultHandlingActionFilter))]
[Route("[controller]")]
public class BaseController : ControllerBase
{
	public int CurrentUserId => throw new NotImplementedException();
}
