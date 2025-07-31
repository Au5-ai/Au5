using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Persistence.Context;

public class DBInitialzer
{
	private readonly ILogger<DBInitialzer> _logger;
	private readonly ApplicationDbContext _dbContext;

	public DBInitialzer(ILogger<DBInitialzer> logger, ApplicationDbContext dbContext)
	{
		_logger = logger;
		_dbContext = dbContext;
	}

	public async Task ExecuteAsync(CancellationToken stoppingToken = default)
	{
		_logger.LogDatabaseInitializationInfo("Initializing Database Started");
		try
		{
#if DEBUG
			if (await _dbContext.Database.EnsureCreatedAsync(stoppingToken))
			{
				var migrations = await _dbContext.Database.GetPendingMigrationsAsync(stoppingToken);
				if (migrations.Any())
				{
					await _dbContext.Database.MigrateAsync(stoppingToken);
				}
			}
#endif
		}
		catch (Exception e)
		{
			_logger.LogDatabaseInitializationException(e.Message, e);
		}

		_logger.LogDatabaseInitializationInfo("Initializing Database Finished");
	}
}
