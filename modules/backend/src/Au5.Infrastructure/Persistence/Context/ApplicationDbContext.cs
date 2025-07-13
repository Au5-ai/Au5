using System.Reflection;
using Au5.Application.Common.Interfaces;
using Au5.Domain.Common;
using Au5.Infrastructure.Persistence.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Persistence.Context;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ILogger<ApplicationDbContext> contextLogger)
	: DbContext(options), IApplicationDbContext
{
	private readonly ILogger<ApplicationDbContext> _logger = contextLogger;

	public new async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
		try
		{
			return await base.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "DataBase_Exception");
			return 0;
		}
	}

	protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
	{
		_ = configurationBuilder.Properties<string>().HaveMaxLength(200);
		_ = configurationBuilder.Properties<string>().AreUnicode(false);
	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.RegisterEntities(typeof(EntityAttribute).Assembly);
		_ = modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
		modelBuilder.SeedData();

		foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
		{
			relationship.DeleteBehavior = DeleteBehavior.NoAction;
		}
	}
}
