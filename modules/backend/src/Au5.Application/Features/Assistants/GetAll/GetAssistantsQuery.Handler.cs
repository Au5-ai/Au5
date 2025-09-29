namespace Au5.Application.Features.Assistants.GetAll;

public class GetAssistantsQueryHandler : IRequestHandler<GetAssistantsQuery, Result<List<Assistant>>>
{
	private readonly IApplicationDbContext _db;

	public GetAssistantsQueryHandler(IApplicationDbContext db)
	{
		_db = db;
	}

	public async ValueTask<Result<List<Assistant>>> Handle(GetAssistantsQuery request, CancellationToken cancellationToken)
	{
		var query = _db.Set<Assistant>().Where(x => !x.IsDefault);

		if(request.IsActive.HasValue)
		{
			query = query.Where(x => x.IsActive == request.IsActive.Value);
		}

		return await query
			.AsNoTracking()
			.ToListAsync(cancellationToken);
	}
}
