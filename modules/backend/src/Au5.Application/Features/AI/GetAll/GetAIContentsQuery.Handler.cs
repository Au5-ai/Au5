namespace Au5.Application.Features.AI.GetAll;

public class GetAIContentsQueryHandler(IApplicationDbContext dbContext) : IRequestHandler<GetAIContentsQuery, Result<IReadOnlyCollection<AIContentsReposne>>>
{
	private readonly IApplicationDbContext _dbContext = dbContext;

	public async ValueTask<Result<IReadOnlyCollection<AIContentsReposne>>> Handle(GetAIContentsQuery request, CancellationToken cancellationToken)
	{
		var aiContents = await _dbContext.Set<AIContents>()
			.Include(x => x.Assistant)
			.Include(x => x.User)
			.AsNoTracking()
			.Where(a => a.MeetingId == request.MeetingId)
			.OrderByDescending(x => x.CreatedAt)
			.Select(x => new AIContentsReposne()
			{
				Assistant = new AIContentAssistant()
				{
					Icon = x.Assistant.Icon,
					Description = x.Assistant.Description,
					Id = x.Assistant.Id,
					Name = x.Assistant.Name,
					Instructions = x.Assistant.Instructions
				},
				Content = x.Content,
				CreatedAt = x.CreatedAt.ToString("dd MMMM yyyy, HH:mm"),
				Id = x.Id,
				User = new Participant
				{
					Id = x.User.Id,
					FullName = x.User.FullName,
					Email = x.User.Email,
					PictureUrl = x.User.PictureUrl,
				}
			})
			.ToListAsync(cancellationToken: cancellationToken);

		return aiContents;
	}
}
