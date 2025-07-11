using System.Security.Claims;
using Au5.Application.Interfaces;
using Au5.Application.Models.Authentication;
using Au5.Application.Models.Messages;
using Au5.BackEnd;
using Au5.BackEnd.Hubs;
using Au5.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
{
	builder.Services.AddSignalR();
	builder.Services.AddJwtAuthentication(builder.Configuration);

	builder.Services.RegisterApplicationServices()
		.RegisterInfrastrustureServices();

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

		return Results.Ok(new { Success = true, Message = $"Bot added to meeting {request.MeetingId}" });
	});

	app.MapGet("/meeting/{meetingId}/transcription", (
		[FromRoute] string meetingId,
		[FromServices] IMeetingService meetingService) =>
	{
		var transcription = meetingService.GetFullTranscriptionAsJson(meetingId);
		return Results.Json(transcription);
	});

	app.MapGet("/reactions", () =>
	{
		List<Reaction> reactions = [
			new Reaction() { Type = "Task", Emoji = "⚡", ClassName = "reaction-task" },
			new Reaction() { Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important" },
			new Reaction() { Type = "Goal", Emoji = "🎯", ClassName = "reaction-question" }
		];

		return Results.Ok(reactions);
	});

	app.MapControllers();

	app.Run();
}
