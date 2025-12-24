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
		var userId = _currentUserService.UserId;
		var organizationId = _currentUserService.OrganizationId;
		var assistants = _dbContext.Set<Assistant>()
			.Where(a => a.OrganizationId == organizationId)
			.AsNoTracking();

		if (_currentUserService.Role == RoleTypes.Admin)
		{
			var adminQuery = assistants.Where(x => x.IsDefault || x.UserId == userId);
			if (request.IsActive.HasValue)
			{
				adminQuery = adminQuery.Where(x => x.IsActive == request.IsActive.Value);
			}

			return await adminQuery.ToListAsync(cancellationToken);
		}

		var query = request.IsActive.HasValue
			? assistants.Where(x => (x.IsDefault && x.IsActive) || (x.UserId == userId && x.IsActive))
			: assistants.Where(x => x.UserId == userId);

		return await query.ToListAsync(cancellationToken);
	}
}
