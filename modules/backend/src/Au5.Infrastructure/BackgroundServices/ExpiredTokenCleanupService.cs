using System.Data;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Options;
using Au5.Domain.Entities;
using Au5.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Au5.Infrastructure.BackgroundServices;

public class ExpiredTokenCleanupService : BackgroundService
{
	private readonly IServiceScopeFactory _scopeFactory;
	private readonly IDataProvider _dataProvider;
	private readonly ILogger<ExpiredTokenCleanupService> _logger;
	private readonly TimeSpan _cleanupInterval;

	public ExpiredTokenCleanupService(IServiceScopeFactory scopeFactory, IDataProvider dataProvider, ILogger<ExpiredTokenCleanupService> logger, IOptions<ServiceSettings> options)
	{
		_scopeFactory = scopeFactory;
		_dataProvider = dataProvider;
		_logger = logger;
		_cleanupInterval = TimeSpan.FromMinutes(options.Value.TokenCleanupIntervalMinutes);
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

		var now = _dataProvider.Now;
		var expiredTokensCount = await dbContext.Set<BlacklistedToken>()
			.Where(t => t.ExpiresAt <= now)
			.ExecuteDeleteAsync(cancellationToken);

		if (expiredTokensCount > 0)
		{
			_logger.LogInformation("Cleaned up {Count} expired blacklisted tokens", expiredTokensCount);
		}
	}
}
