using Au5.Application.Features.Reactions.GetAllQuery;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

public class ReactionsController(ISender mediator) : BaseController
{
	[HttpGet]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[Authorize(Policy = AuthorizationPolicies.UserOrAdmin)]
	public async ValueTask<IActionResult> GetAll(CancellationToken ct)
	{
		return Ok(await mediator.Send(new GetAllReactionsQuery(), ct));
	}
}
