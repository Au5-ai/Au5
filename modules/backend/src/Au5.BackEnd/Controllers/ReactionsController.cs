namespace Au5.BackEnd.Controllers;

[ApiController]
[Route("[controller]")]
public class ReactionsController(IReactionService reactionService) : ControllerBase
{
	private readonly IReactionService _reactionService = reactionService;

	[HttpGet]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetAll(CancellationToken ct)
	{
		var reactions = await _reactionService.GetAllAsync(ct).ConfigureAwait(false);
		return Ok(reactions);
	}
}
