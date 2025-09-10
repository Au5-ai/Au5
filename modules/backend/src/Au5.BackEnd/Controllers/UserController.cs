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

		[HttpGet]
		[Route("")]
		public async Task<IActionResult> GetUsers()
		{
			var result = await mediator.Send(new GetUsersQuery());
			return Ok(result);
		}

		[HttpGet]
		[Route("stats")]
		public async Task<IActionResult> GetUserStats()
		{
			var result = await mediator.Send(new GetUserStatsQuery());
			return Ok(result);
		}

		[HttpPost]
		[Route("invite")]
		public async Task<IActionResult> InviteUsers([FromBody] InviteUsersRequest request)
		{
			var result = await mediator.Send(new InviteUsersCommand(request.Emails, request.Role));
			return Ok(result);
		}

		[HttpPut]
		[Route("{userId}")]
		public async Task<IActionResult> EditUser(string userId, [FromBody] EditUserRequest request)
		{
			// TODO: Replace with actual command
			var result = await mediator.Send(new EditUserCommand(userId, request));
			return Ok(result);
		}

		[HttpPatch]
		[Route("{userId}/status")]
		public async Task<IActionResult> ToggleUserStatus(string userId, [FromBody] ToggleUserStatusRequest request)
		{
			var result = await mediator.Send(new ToggleUserStatusCommand(userId, request.IsValid));
			return Ok(result);
		}

		[HttpGet]
		[Route("search")]
		public async Task<IActionResult> SearchUsers([FromQuery] string query, [FromQuery] Dictionary<string, string> filters)
		{
			var result = await mediator.Send(new SearchUsersQuery(query, filters));
			return Ok(result);
		}
	}
}
