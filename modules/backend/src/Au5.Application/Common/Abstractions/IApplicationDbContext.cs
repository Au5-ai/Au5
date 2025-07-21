using Microsoft.EntityFrameworkCore;

namespace Au5.Application.Common.Abstractions;

/// <summary>
/// This interface facilitates communication between the application layer, infrastructure, and the DbContext.
/// </summary>
public interface IApplicationDbContext
{
	public Task<int> SaveChangesAsync(CancellationToken cancellationToken);

	DbSet<TEntity> Set<TEntity>()
		where TEntity : class;
}
