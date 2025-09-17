using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Application.Features.UserManagement.GetUsers;
using Au5.Application.Features.UserManagement.InviteUsers;
using Au5.Application.Features.UserManagement.VerifyUser.Query;

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

	[HttpPost]
	[Route("invite")]
	public async Task<IActionResult> InviteUsers([FromBody] List<InviteUsersRequest> invites)
	{
		var result = await mediator.Send(new InviteUsersCommand(invites));
		return Ok(result);
	}

	[HttpGet("/{userId}/verify")]
	public async Task<IActionResult> VerifyUser([FromRoute] Guid userId, [FromQuery] string hash)
	{
		var command = new VerifyUserQuery(userId, hash);
		return Ok(await mediator.Send(command));
	}

	// [HttpPost("verify/{userId}")]
	// public async Task<IActionResult> VerifyUser([FromRoute] string userId, [FromQuery] string hash)
	// {
	// var command = new VerifyEmailCommand
	// {
	// UserId = userId,
	// VerificationToken = token
	// };
	// return Ok(await mediator.Send(command));
	// }
}
