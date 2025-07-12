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
}

var app = builder.Build();

app.MapDefaultEndpoints();
{
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

	app.MapGet("/meeting/{meetingId}/transcription", (
		[FromRoute] string meetingId,
		[FromServices] IMeetingService meetingService) =>
	{
		var transcription = meetingService.GetFullTranscriptionAsJson(meetingId);
		return Results.Json(transcription);
	});

	app.MapGet("/reactions", async (IReactionService reactionService, CancellationToken ct) =>
	{
		return Results.Ok(await reactionService.GetAllAsync(ct));
	});

	app.MapControllers();

	app.Run();
}
