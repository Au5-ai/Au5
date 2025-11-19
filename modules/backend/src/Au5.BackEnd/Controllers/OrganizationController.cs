using Au5.Application.Features.Organizations.ExtensionConfig;
using Au5.Application.Features.Organizations.GetConfig;
using Au5.Application.Features.Organizations.SetConfig;
using Microsoft.AspNetCore.Authorization;

namespace Au5.BackEnd.Controllers;

[Route("organizations")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public class OrganizationController(ISender mediator) : BaseController
{
	[HttpPost("")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> UpdateOrganization([FromBody] OrganizationCommand command)
	{
		return Ok(await mediator.Send(command));
	}

	[HttpGet("")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetOrganization()
	{
		return Ok(await mediator.Send(new OrganizationQuery()));
	}

	[HttpGet("extension")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[Authorize(Policy = AuthorizationPolicies.UserOrAdmin)]
	public async Task<IActionResult> GetExtensionConfig()
	{
		return Ok(await mediator.Send(new ExtensionConfigQuery()));
	}
}
