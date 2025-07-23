using Ardalis.GuardClauses;
using Au5.Application.Common.Abstractions;
using Au5.Infrastructure.Authentication;
using Au5.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Infrastructure;

/// <summary>
/// This extension is programmed for registering Infrastructure services .
/// </summary>
public static class ConfigureServices
{
	public static IServiceCollection RegisterInfrastructureServices(
		this IServiceCollection services,
		IConfiguration configuration)
	{
		var connectionString = configuration.GetConnectionString(nameof(ApplicationDbContext));

		Guard.Against.Null(connectionString, message: "Connection string 'DefaultConnection' not found.");

		services.AddScoped<DBInitialzer>();
		services.AddDbContext<IApplicationDbContext, ApplicationDbContext>(opt =>
		{
			opt.UseSqlServer(
				connectionString,
				(db) => { db.MigrationsHistoryTable("MigrationHistory"); });
		});

		services.AddScoped<ITokenService, TokenService>();

		return services;
	}
}
