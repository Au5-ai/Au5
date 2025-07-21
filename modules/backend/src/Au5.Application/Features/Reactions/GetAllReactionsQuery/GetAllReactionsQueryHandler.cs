using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Reactions.GetAllReactionsQuery;

public sealed class GetAllReactionsQueryHandler(IApplicationDbContext dbContext)
	: IRequestHandler<GetAllReactionsQuery, IReadOnlyCollection<Reaction>>
{
	private readonly IApplicationDbContext _context = dbContext;

	public async ValueTask<IReadOnlyCollection<Reaction>> Handle(GetAllReactionsQuery request, CancellationToken cancellationToken)
	{
		return await _context.Set<Reaction>()
				.ToListAsync(cancellationToken)
				.ConfigureAwait(false);
	}
}
