using System.Reflection;
using Au5.Application.Common.Interfaces;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.Infrastructure.Persistence.Consts;
using Au5.Infrastructure.Persistence.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Persistence.Context;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ILogger<ApplicationDbContext> contextLogger)
	: DbContext(options), IApplicationDbContext
{
	private readonly ILogger<ApplicationDbContext> logger = contextLogger;

	public new async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
		try
		{
			return await base.SaveChangesAsync(cancellationToken);
		}
		catch (Exception ex)
		{
			logger.LogError(ex, "DataBase_Exception");
			return 0;
		}
	}

	protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
	{
		configurationBuilder.Properties<string>().HaveMaxLength(200);
		configurationBuilder.Properties<string>().AreUnicode(false);
	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.RegisterEntities(typeof(EntityAttribute).Assembly);
		modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

		foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
		{
			relationship.DeleteBehavior = DeleteBehavior.NoAction;
		}

		SeedReactions(modelBuilder);
	}

	private void SeedReactions(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Reaction>().HasData(
			new Reaction { Id = 1, Type = "Task", Emoji = "⚡", ClassName = "reaction-task" },
			new Reaction { Id = 2, Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important" },
			new Reaction { Id = 3, Type = "Goal", Emoji = "🎯", ClassName = "reaction-question" });
	}
}
