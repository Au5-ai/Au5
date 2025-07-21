using Au5.BackEnd.GlobalHandler;

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
	app.UseExceptionHandler();
	app.MapDefaultEndpoints();

	app.UseCors("AllowAllWithCredentials");
	app.UseRouting();

	app.UseAuthentication();
	app.UseAuthorization();

	app.UseCors();
	app.MapHub<MeetingHub>("/meetinghub").AllowAnonymous();
	app.MapGet("/liveness", () => Results.Ok("Healthy"));

	app.MapPost("/meeting/addBot", (
		[FromBody] RequestToAddBotMessage request,
		[FromServices] IMeetingService meetingService) =>
	{
		var result = meetingService.RequestToAddBot(request);

		return Results.Ok(new { Success = true, Message = $"Bot added to meeting {request.MeetId}", Data = result });
	});

	app.MapControllers();

	app.Run();
}
