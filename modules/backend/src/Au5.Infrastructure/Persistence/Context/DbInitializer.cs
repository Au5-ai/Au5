using Au5.Domain.Entities;
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

				await TrySeedAsync(stoppingToken);
			}
#endif
		}
		catch (Exception e)
		{
			_logger.LogDatabaseInitializationException(e.Message, e);
		}

		_logger.LogDatabaseInitializationInfo("Initializing Database Finished");
	}

	private async Task TrySeedAsync(CancellationToken cancellationToken = default)
	{
		_logger.LogDatabaseInitializationInfo("Seed Database Started");

		if (_dbContext.Set<User>().Any())
		{
			return;
		}

		_dbContext.Set<User>().Add(new()
		{
			Email = "mha.karimi@gmail.com",
			IsActive = true,
			FullName = "Mohammad Karimi",
			Id = Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960"),
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA="
		});
		await _dbContext.SaveChangesAsync(cancellationToken);

		_logger.LogDatabaseInitializationInfo("Seed Database Finished");
	}
}
