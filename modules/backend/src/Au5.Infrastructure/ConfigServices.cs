using System.ClientModel;
using Ardalis.GuardClauses;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Options;
using Au5.Infrastructure.Adapters;
using Au5.Infrastructure.Authentication;
using Au5.Infrastructure.Persistence.Context;
using Au5.Infrastructure.Providers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenAI;

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

		services.AddDbContext<IApplicationDbContext, ApplicationDbContext>(opt =>
		{
			opt.UseSqlServer(
				connectionString,
				(db) => { db.MigrationsHistoryTable("MigrationHistory"); });
		});

		services.AddScoped<ICacheProvider, DistributedCacheCacheProvider>();
		services.AddScoped<ITokenService, TokenService>();
		services.AddScoped<IBotFatherAdapter, BotFatherAdapter>();
		services.AddScoped<IEmailProvider, EmailProvider>();
		services.AddTransient<ISmtpClientWrapper, SmtpClientWrapper>();

		services.AddSingleton<OpenAIClient>(sp =>
		{
			var orgOptions = configuration.GetSection(OrganizationOptions.SectionName).Get<OrganizationOptions>();
			var options = new OpenAIClientOptions();

			if (!string.IsNullOrWhiteSpace(orgOptions?.OpenAIProxyUrl))
			{
				options.Endpoint = new Uri(orgOptions.OpenAIProxyUrl);
			}

			var apiKey = orgOptions?.OpenAIToken ?? string.Empty;
			return new OpenAIClient(new ApiKeyCredential(apiKey), options);
		});

		services.AddScoped<IAIClient, OpenAIClientAdapter>();

		services.AddStackExchangeRedisCache(options =>
		{
			options.Configuration = configuration.GetConnectionString("Redis")!;
			options.InstanceName = "Au5:";
		});

		return services;
	}
}
