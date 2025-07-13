using Au5.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Features.Implement;

public class ReactionService(IApplicationDbContext dbContext) : IReactionService
{
	private readonly IApplicationDbContext _context = dbContext;

	public async Task<IReadOnlyCollection<Reaction>> GetAllAsync(CancellationToken ct)
	{
		return await _context.Set<Reaction>().ToListAsync(ct).ConfigureAwait(false);
	}
}
