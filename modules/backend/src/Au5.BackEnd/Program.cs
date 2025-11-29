using Au5.BackEnd.GlobalHandler;
using Au5.BackEnd.Middlewares;
using Au5.Domain.Common;
using Au5.ServiceDefaults;
using Microsoft.AspNetCore.Authentication.JwtBearer;

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
	});

	builder.Services.AddControllers();
	builder.Logging.ClearProviders();
	builder.Logging.AddConsole();
	builder.Logging.SetMinimumLevel(LogLevel.Information);

	builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
	builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
	builder.Services.AddProblemDetails();
	builder.Services.AddAuthorizationBuilder()
		.AddPolicy(AuthorizationPolicies.AdminOnly, policy => policy.RequireRole(nameof(RoleTypes.Admin)))
		.AddPolicy(AuthorizationPolicies.UserOnly, policy => policy.RequireRole(nameof(RoleTypes.User)))
		.AddPolicy(AuthorizationPolicies.UserOrAdmin, policy => policy.RequireRole(nameof(RoleTypes.Admin), nameof(RoleTypes.User)));
}

var app = builder.Build();
{
	app.UseExceptionHandler();

	if (app.Environment.IsProduction())
	{
		app.UseHsts();
		app.UseHttpsRedirection();
	}

	app.UseRouting();
	app.UseCors();

	app.UseAuthentication();
	app.UseMiddleware<JwtBlacklistMiddleware>();
	app.UseAuthorization();

	app.MapDefaultEndpoints();
	app.MapHub<MeetingHub>("/meetinghub");

	app.MapControllers();

	app.Run();
}

/// <summary>
/// Entry point for the application.
/// </summary>
public partial class Program
{
}
