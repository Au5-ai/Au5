using Au5.Application.Features.Meetings.AddBot;
using Au5.Domain.Entities;
using Au5.IntegrationTests.TestHelpers;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.IntegrationTests.Application.Features;

public class AddBotCommandHandlerTests : BaseIntegrationTest
{
	private const string BaseApiAddress = "https://borfatherapi";

	public AddBotCommandHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	private FakeHttpMessageHandler FakeHttpHandler =>
		WebApp.Services.GetRequiredService<FakeHttpMessageHandler>();

	[Fact]
	public async Task Should_AddBot_Successfully_When_SystemConfigExists()
	{
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;

		DbContext.Set<SystemConfig>().Add(new SystemConfig
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			HubUrl = "https://example.com/hub",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
			PanelUrl = "https://example.com/panel",
			ServiceBaseUrl = "https://example.com/api",
			OpenAIToken = "sk-test-token",
			AutoLeaveWaitingEnter = 10,
			AutoLeaveNoParticipant = 5,
			AutoLeaveAllParticipantsLeft = 2,
			MeetingVideoRecording = true,
			BotFatherUrl = BaseApiAddress,
			BotHubUrl = "https://bot-hub.example.com",
			MeetingAudioRecording = true,
			MeetingTranscription = true,
			MeetingTranscriptionModel = "liveCaption"
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		FakeHttpHandler.AddExpectation(new HttpRequestWithJsonResponse()
		{
			ResponseContent = "{\"meetingUrl\":\"FakeMeetId\",\"title\":\"Cando\"}",
			Method = HttpMethod.Post,
			RequestAddress = BaseApiAddress + "/create-container",
		});

		var command = new AddBotCommand("GoogleMeet", "Cando", "FakeMeetId");
		var response = await Mediator.Send(command);

		Assert.True(response.IsSuccess);

		// var meeting = await Context.Meetings.FirstOrDefaultAsync();
		// Assert.NotNull(meeting);
		// Assert.Equal(command.MeetingUrl, meeting.MeetingUrl);
		// Assert.Equal(command.Title, meeting.Title);
		// Assert.Equal(userId, meeting.CreatedBy);
		// Assert.Equal(MeetingStatus.AddingBot, meeting.Status);
		// Assert.Equal(expectedResponse.ContainerId, meeting.ContainerId);
		// Assert.Equal(expectedResponse.BotUrl, meeting.BotUrl);
	}
}
