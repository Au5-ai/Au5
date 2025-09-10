using Au5.Application.Features.UserManagement.EditUser;
using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Application.Features.UserManagement.GetUsers;
using Au5.Application.Features.UserManagement.InviteUsers;
using Au5.Application.Features.UserManagement.Search;
using Au5.Application.Features.UserManagement.ToggleStatus;
using Au5.Application.Features.UserManagement.UserStats;

namespace Au5.BackEnd.Controllers;

public class UsersController(ISender mediator) : BaseController
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
	public async Task<IActionResult> InviteUsers([FromBody] List<InviteUsersRequest> invites)
	{
		var result = await mediator.Send(new InviteUsersCommand(invites));
		return Ok(result);
	}

	[HttpPut]
	[Route("{userId}")]
	public async Task<IActionResult> EditUser(string userId, [FromBody] EditUserRequest request)
	{
		var result = await mediator.Send(new EditUserCommand(userId, request));
		return Ok(result);
	}

	[HttpPatch]
	[Route("{userId}/status")]
	public async Task<IActionResult> ToggleUserStatus([FromRoute] Guid userId, [FromBody] ToggleUserStatusCommand request)
	{
		var result = await mediator.Send(request with { UserId = userId });
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
