namespace Au5.Application.Features.AI.GetAll;

public class GetAIContentsQueryHandler(IApplicationDbContext dbContext) : IRequestHandler<GetAIContentsQuery, Result<IReadOnlyCollection<AIContents>>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;

	public async ValueTask<Result<IReadOnlyCollection<AIContents>>> Handle(GetAIContentsQuery request, CancellationToken cancellationToken)
	{
		var aiContents = await _dbContext.Set<AIContents>()
			.Include(x => x.Assistant)
			.Include(x => x.User)
			.AsNoTracking()
			.Where(a => a.MeetingId == request.MeetingId)
			.ToListAsync(cancellationToken: cancellationToken);

		return aiContents;
	}
}
