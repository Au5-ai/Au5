namespace Au5.Application.Features.AI.Delete;

public class DeleteAIContentCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<DeleteAIContentCommand, Result<bool>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<Result<bool>> Handle(DeleteAIContentCommand request, CancellationToken cancellationToken)
	{
		var aiContent = await _dbContext.Set<AIContents>()
			.FirstOrDefaultAsync(x => x.Id == request.Id && x.MeetingId == request.MeetingId && x.IsActive, cancellationToken);

		if (aiContent is null)
		{
			return Error.NotFound("AI.ContentNotFound", "AI Content not found");
		}

		aiContent.RemoverUserId = _currentUserService.UserId;
		aiContent.IsActive = false;
		await _dbContext.SaveChangesAsync(cancellationToken);

		return true;
	}
}
