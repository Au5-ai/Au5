using Au5.BackEnd.GlobalHandler;
using Au5.BackEnd.Middlewares;
using Au5.Infrastructure.Persistence.Context;
using Au5.ServiceDefaults;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();
{
	builder.Services.AddSignalR();
	builder.Services.AddJwtAuthentication(builder.Configuration);

	builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
	{
		if (builder.Environment.IsProduction())
		{
			options.RequireHttpsMetadata = true;
		}
	});

	builder.Services.RegisterApplicationServices(builder.Configuration)
					.RegisterInfrastructureServices(builder.Configuration);

	var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins")
												  .Get<string[]>();

	if (allowedOrigins is null || allowedOrigins.Length == 0)
	{
		throw new InvalidOperationException("CORS allowed origins are not configured or are empty in appsettings.json.");
	}

	builder.Services.AddCors(options =>
	{
		options.AddDefaultPolicy(policy =>
			policy
				.WithOrigins(allowedOrigins)
				.AllowAnyHeader()
				.AllowAnyMethod());

		options.AddPolicy("AllowAllWithCredentials", policy =>
		{
			policy
				.WithOrigins(allowedOrigins)
				.AllowAnyMethod()
				.AllowAnyHeader()
				.AllowCredentials();
		});
	});

	builder.Services.AddControllers();
	builder.Logging.ClearProviders();
	builder.Logging.AddConsole();
	builder.Logging.SetMinimumLevel(LogLevel.Information);

	builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
	builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
	builder.Services.AddProblemDetails();
}

var app = builder.Build();
{
	using (var scope = app.Services.CreateScope())
	{
		var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
		if (db.Database.GetPendingMigrations().Any())
		{
			db.Database.Migrate();
		}
		}

	app.UseExceptionHandler();
	app.MapDefaultEndpoints();

	app.UseCors("AllowAllWithCredentials");

	if (app.Environment.IsProduction())
	{
		app.UseHsts();
		app.UseHttpsRedirection();
	}

	app.UseRouting();

	app.UseAuthentication();
	app.UseMiddleware<JwtBlacklistMiddleware>();
	app.UseAuthorization();

	app.UseCors();
	app.MapHub<MeetingHub>("/meetinghub").AllowAnonymous();

	app.MapControllers();

	app.Run();
}

/// <summary>
/// Entry point for the application.
/// </summary>
public partial class Program
{
}
