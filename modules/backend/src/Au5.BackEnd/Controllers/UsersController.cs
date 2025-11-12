using System.ComponentModel.DataAnnotations;
using Au5.Application.Features.Meetings.MyMeeting;
using Au5.Application.Features.Spaces.GetUserSpaces;
using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Application.Features.UserManagement.GetUserMenus;
using Au5.Application.Features.UserManagement.GetUsers;
using Au5.Application.Features.UserManagement.InviteUsers;
using Au5.Application.Features.UserManagement.ResendVerificationEmail;
using Au5.Application.Features.UserManagement.Search;
using Au5.Application.Features.UserManagement.VerifyUser.Command;
using Au5.Application.Features.UserManagement.VerifyUser.Query;
using Au5.Domain.Common;
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

	[HttpGet("me/meetings")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> MyMeetings([FromQuery] string status, CancellationToken cancellationToken)
	{
		var meetingStatus = MeetingStatus.Ended;
		if (status.Equals("archived", StringComparison.OrdinalIgnoreCase))
		{
			meetingStatus = MeetingStatus.Archived;
		}

		return Ok(await mediator.Send(new MyMeetingQuery(meetingStatus), cancellationToken));
	}

	[HttpGet]
	[Route("spaces")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetMySpaces(CancellationToken ct)
	{
		return Ok(await mediator.Send(new UserSpacesQuery(), ct));
	}

	[Route("search")]
	[HttpGet]
	public async Task<IActionResult> SearchUsers([FromQuery][Required][MinLength(2)][MaxLength(100)] string query)
	{
		var result = await mediator.Send(new SearchUserQuery(query));
		return Ok(result);
	}

	[HttpPost]
	[Route("invitations")]
	public async Task<IActionResult> InviteUsers([FromBody] List<InviteUsersRequest> invites)
	{
		var result = await mediator.Send(new InviteUsersCommand(invites));
		return Ok(result);
	}

	[AllowAnonymous]
	[HttpPost("invitations/{userId}/resend")]
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
