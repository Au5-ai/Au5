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
		return await _db.Set<Assistant>()
			.Where(x => x.IsActive && !x.IsDefault)
			.AsNoTracking()
			.ToListAsync(cancellationToken);
	}
}
