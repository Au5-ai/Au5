namespace Au5.Application.Features.AI.GetAll;

public class GetAIContentsQueryHandler(IApplicationDbContext dbContext) : IRequestHandler<GetAIContentsQuery, Result<IReadOnlyCollection<AIContents>>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;

	public async ValueTask<Result<IReadOnlyCollection<AIContents>>> Handle(GetAIContentsQuery request, CancellationToken cancellationToken)
	{
		var aiContents = await _dbContext.Set<AIContents>()
			.Include(x => x.Assistant)
			.AsNoTracking()
			.Where(a => a.MeetingId == request.MeetingId)
			.OrderByDescending(x => x.CreatedAt)
			.ToListAsync(cancellationToken: cancellationToken);

		return aiContents;
	}
}
