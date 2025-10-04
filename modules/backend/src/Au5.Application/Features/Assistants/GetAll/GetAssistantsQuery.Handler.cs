namespace Au5.Application.Features.Assistants.GetAll;

public class GetAssistantsQueryHandler : IRequestHandler<GetAssistantsQuery, Result<IReadOnlyCollection<Assistant>>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly ICurrentUserService _currentUserService;

	public GetAssistantsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	{
		_dbContext = dbContext;
		_currentUserService = currentUserService;
	}

	public async ValueTask<Result<IReadOnlyCollection<Assistant>>> Handle(GetAssistantsQuery request, CancellationToken cancellationToken)
	{
		var assistants = _dbContext.Set<Assistant>().AsNoTracking();

		if (_currentUserService.Role == RoleTypes.Admin)
		{
			return await assistants.Where(x => x.IsDefault).ToListAsync(cancellationToken);
		}

		var userId = _currentUserService.UserId;
		IQueryable<Assistant> query;

		if (request.IsActive.HasValue)
		{
			query = assistants.Where(x => (x.IsDefault && x.IsActive) || (x.UserId == userId && x.IsActive));
		}
		else
		{
			query = assistants.Where(x => x.UserId == userId);
		}

		return await query.ToListAsync(cancellationToken);
	}
}
