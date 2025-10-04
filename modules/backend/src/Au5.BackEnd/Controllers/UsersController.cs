using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Application.Features.UserManagement.GetUserMenus;
using Au5.Application.Features.UserManagement.GetUsers;
using Au5.Application.Features.UserManagement.InviteUsers;
using Au5.Application.Features.UserManagement.ResendVerificationEmail;
using Au5.Application.Features.UserManagement.VerifyUser.Command;
using Au5.Application.Features.UserManagement.VerifyUser.Query;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class UsersController(ISender mediator) : BaseController
{
	[HttpGet]
	[Route("")]
	public async Task<IActionResult> GetUsers()
	{
		var result = await mediator.Send(new GetUsersQuery());
		return Ok(result);
	}

	[Route("me")]
	public async Task<IActionResult> GetCurrentUserInfo()
	{
		return Ok(await mediator.Send(new GetMyInfoQuery()));
	}

	[HttpGet("me/menus")]
	public async Task<IActionResult> GetCurrentUserMenus()
	{
		var query = new GetUserMenusQuery();
		return Ok(await mediator.Send(query));
	}

	[HttpPost]
	[Route("invitations")]
	public async Task<IActionResult> InviteUsers([FromBody] List<InviteUsersRequest> invites)
	{
		var result = await mediator.Send(new InviteUsersCommand(invites));
		return Ok(result);
	}

	[AllowAnonymous]
	[HttpPost("{userId}/invitations")]
	public async Task<IActionResult> ResendInvitation([FromRoute] Guid userId)
	{
		return Ok(await mediator.Send(new ResendVerificationEmailCommand() { UserId = userId }));
	}

	[AllowAnonymous]
	[HttpGet("{userId}/verify")]
	public async Task<IActionResult> VerifyUser([FromRoute] Guid userId, [FromQuery] string hash)
	{
		var command = new VerifyUserQuery(userId, hash);
		return Ok(await mediator.Send(command));
	}

	[AllowAnonymous]
	[HttpPost("{userId}/verify")]
	public async Task<IActionResult> VerifyUser([FromRoute] Guid userId, [FromBody] VerifyUserCommand verifyUserCommand)
	{
		return Ok(await mediator.Send(verifyUserCommand with { UserId = userId }));
	}
}
