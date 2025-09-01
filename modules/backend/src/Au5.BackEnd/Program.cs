using Au5.BackEnd.GlobalHandler;
using Au5.BackEnd.Middlewares;
using Au5.Infrastructure.Persistence.Context;
using Au5.ServiceDefaults;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
{
	builder.Services.AddSignalR();
	builder.Services.AddJwtAuthentication(builder.Configuration);

	builder.Services.RegisterApplicationServices()
					.RegisterInfrastructureServices(builder.Configuration);

	builder.Services.AddCors(options =>
	{
		options.AddDefaultPolicy(policy =>
			policy
				.AllowAnyHeader()
				.AllowAnyMethod()
				.AllowAnyOrigin());
	});

	builder.Services.AddCors(options =>
	{
		options.AddPolicy("AllowAllWithCredentials", policy =>
		{
			policy
				.SetIsOriginAllowed(origin => true)
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
