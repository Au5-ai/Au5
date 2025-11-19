using Au5.BackEnd.Filters;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Authorize]
[ApiController]
[ServiceFilter(typeof(ResultHandlingActionFilter))]
[Route("[controller]")]
public class BaseController : ControllerBase
{
}
