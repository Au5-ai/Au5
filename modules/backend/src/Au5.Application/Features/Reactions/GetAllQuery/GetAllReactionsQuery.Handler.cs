using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Reactions.GetAllQuery;

public sealed class GetAllReactionsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
	: IRequestHandler<GetAllReactionsQuery, IReadOnlyCollection<Reaction>>
{
	private readonly IApplicationDbContext _context = dbContext;
	private readonly ICurrentUserService _currentUserService = currentUserService;

	public async ValueTask<IReadOnlyCollection<Reaction>> Handle(GetAllReactionsQuery request, CancellationToken cancellationToken)
	{
		var organizationId = _currentUserService.OrganizationId;

		return await _context.Set<Reaction>()
				.Where(r => r.OrganizationId == organizationId)
				.ToListAsync(cancellationToken)
				.ConfigureAwait(false);
	}
}
