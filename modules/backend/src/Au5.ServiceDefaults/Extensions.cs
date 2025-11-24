using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace Au5.ServiceDefaults;

public static class Extensions
{
	public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		builder.ConfigureOpenTelemetry();
		builder.AddDefaultHealthChecks();

		builder.Services.AddServiceDiscovery();

		builder.Services.ConfigureHttpClientDefaults(http =>
		{
			http.AddStandardResilienceHandler();
			http.AddServiceDiscovery();
		});

		return builder;
	}

	public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		builder.Logging.AddOpenTelemetry(logging =>
		{
			logging.IncludeFormattedMessage = true;
			logging.IncludeScopes = true;
		});

		builder.Services.AddOpenTelemetry()
			.WithMetrics(metrics =>
			{
				metrics.AddAspNetCoreInstrumentation()
					.AddHttpClientInstrumentation()
					.AddRuntimeInstrumentation();
			})
			.WithTracing(tracing =>
			{
				tracing.AddSource(builder.Environment.ApplicationName)
					.AddAspNetCoreInstrumentation()
					// Uncomment the following line to enable gRPC instrumentation (requires the OpenTelemetry.Instrumentation.GrpcNetClient package)
					//.AddGrpcClientInstrumentation()
					.AddHttpClientInstrumentation();
			});

		builder.AddOpenTelemetryExporters();

		return builder;
	}

	private static TBuilder AddOpenTelemetryExporters<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
	{
		var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

		if (useOtlpExporter)
		{
			builder.Services.AddOpenTelemetry().UseOtlpExporter();
		}

		return builder;
	}

	public static IHostApplicationBuilder AddDefaultHealthChecks(this IHostApplicationBuilder builder)
	{
		builder.Services.AddRequestTimeouts(
			configure: timeouts =>
				timeouts.AddPolicy("HealthChecks", TimeSpan.FromSeconds(5)));

		builder.Services.AddOutputCache(
			configureOptions: caching =>
				caching.AddPolicy("HealthChecks",
				build: static policy => policy.Expire(TimeSpan.FromSeconds(30))));

		var healthChecksBuilder = builder.Services.AddHealthChecks()
			.AddCheck("self", () => HealthCheckResult.Healthy(), ["live"])
			.AddSqlServer(
				connectionString: builder.Configuration.GetConnectionString("ApplicationDbContext") ?? "",
				name: "database",
				tags: ["ready"]);

		var useRedis = builder.Configuration.GetValue("ServiceSettings:UseRedis", false);
		var redisConnectionString = builder.Configuration.GetConnectionString("Redis");

		if (useRedis && !string.IsNullOrWhiteSpace(redisConnectionString))
		{
			healthChecksBuilder.AddRedis(
				redisConnectionString: redisConnectionString,
				name: "redis_cache",
				tags: ["ready"]);
		}

		return builder;
	}

	public static WebApplication MapDefaultEndpoints(this WebApplication app)
	{
		var healthChecks = app.MapGroup("");

		healthChecks
			  .CacheOutput(policyName: "HealthChecks")
			  .WithRequestTimeout(policyName: "HealthChecks");

		healthChecks.MapHealthChecks("/health", new HealthCheckOptions
		{
			ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
		});

		healthChecks.MapHealthChecks("/health/live", new HealthCheckOptions
		{
			ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
			Predicate = static r => r.Tags.Contains("live")
		});

		healthChecks.MapHealthChecks("/health/ready", new HealthCheckOptions
		{
			ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
			Predicate = static r => r.Tags.Contains("ready")
		});

		return app;
	}
}
