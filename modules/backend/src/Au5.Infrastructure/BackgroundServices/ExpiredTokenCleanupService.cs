using Au5.Application.Common.Abstractions;
using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.BackgroundServices;

public class ExpiredTokenCleanupService : BackgroundService
{
	private readonly IServiceScopeFactory _scopeFactory;
	private readonly ILogger<ExpiredTokenCleanupService> _logger;
	private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1);

	public ExpiredTokenCleanupService(IServiceScopeFactory scopeFactory, ILogger<ExpiredTokenCleanupService> logger)
	{
		_scopeFactory = scopeFactory;
		_logger = logger;
	}

	protected override async Task ExecuteAsync(CancellationToken stoppingToken)
	{
		_logger.LogInformation("Expired Token Cleanup Service started");

		while (!stoppingToken.IsCancellationRequested)
		{
			try
			{
				await CleanupExpiredTokensAsync(stoppingToken);
				await Task.Delay(_cleanupInterval, stoppingToken);
			}
			catch (OperationCanceledException)
			{
				_logger.LogInformation("Expired Token Cleanup Service is stopping");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error occurred while cleaning up expired tokens");
				await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
			}
		}
	}

	private async Task CleanupExpiredTokensAsync(CancellationToken cancellationToken)
	{
		using var scope = _scopeFactory.CreateScope();
		var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

		var now = DateTime.UtcNow;
		var expiredTokens = await dbContext.Set<BlacklistedToken>()
			.Where(t => t.ExpiresAt <= now)
			.ToListAsync(cancellationToken);

		if (expiredTokens.Count != 0)
		{
			foreach (var token in expiredTokens)
			{
				dbContext.Set<BlacklistedToken>().Remove(token);
			}

			await dbContext.SaveChangesAsync(cancellationToken);
			_logger.LogInformation("Cleaned up {Count} expired blacklisted tokens", expiredTokens.Count);
		}
	}
}
