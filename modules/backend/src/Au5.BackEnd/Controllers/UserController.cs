using Au5.Application.Features.UserManagement.GetMyInfo;

namespace Au5.BackEnd.Controllers
{
	public class UserController(ISender mediator) : BaseController
	{
		[Route("me")]
		public async Task<IActionResult> GetMyInfo()
		{
			return Ok(await mediator.Send(new GetMyInfoQuery()));
		}
	}
}
