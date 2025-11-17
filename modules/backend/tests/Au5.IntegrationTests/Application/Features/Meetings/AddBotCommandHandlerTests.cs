using Au5.Application.Features.Meetings.AddBot;
using Au5.Domain.Entities;
using Au5.IntegrationTests.TestHelpers;

namespace Au5.IntegrationTests.Application.Features.Meetings;

public class AddBotCommandHandlerTests : BaseIntegrationTest
{
	private const string BaseApiAddress = "https://botfatherapi";

	public AddBotCommandHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Should_AddBot_Successfully_When_OrganizationExists()
	{
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;

		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var expectedResponse = new JsonResponse()
		{
			ExpectedResponse = "{\"meetingUrl\":\"FakeMeetId\",\"title\":\"Cando\"}",
			Method = HttpMethod.Post,
			RequestAddress = BaseApiAddress + "/create-container",
		};

		AddExceptedResponse(expectedResponse);

		var command = new AddBotCommand("GoogleMeet", "Cando", "FakeMeetId");
		var response = await Mediator.Send(command);

		Assert.True(response.IsSuccess);
	}

	[Fact]
	public async Task Should_AddBot_Successfully_When_OrganizationExists2()
	{
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;

		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var expectedResponse = new JsonResponse()
		{
			ExpectedResponse = "{\"meetingUrl\":\"FakeMeetId\",\"title\":\"Cando2\"}",
			Method = HttpMethod.Post,
			RequestAddress = BaseApiAddress + "/create-container",
		};

		AddExceptedResponse(expectedResponse);

		var command = new AddBotCommand("GoogleMeet", "Cando", "FakeMeetId");
		var response = await Mediator.Send(command);

		Assert.True(response.IsSuccess);
	}

	[Fact]
	public async Task Should_AddBot_Successfully_When_OrganizationExists3()
	{
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;

		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var expectedResponse = new JsonResponse()
		{
			ExpectedResponse = "{\"meetingUrl\":\"FakeMeetId\",\"title\":\"Cando3\"}",
			Method = HttpMethod.Post,
			RequestAddress = BaseApiAddress + "/create-container",
		};

		AddExceptedResponse(expectedResponse);

		var command = new AddBotCommand("GoogleMeet", "Cando", "FakeMeetId");
		var response = await Mediator.Send(command);

		Assert.True(response.IsSuccess);
	}

	[Fact]
	public async Task Should_AddBot_Successfully_When_OrganizationExists4()
	{
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;

		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var expectedResponse = new JsonResponse()
		{
			ExpectedResponse = "{\"meetingUrl\":\"FakeMeetId\",\"title\":\"Cando4\"}",
			Method = HttpMethod.Post,
			RequestAddress = BaseApiAddress + "/create-container",
		};

		AddExceptedResponse(expectedResponse);

		var command = new AddBotCommand("GoogleMeet", "Cando", "FakeMeetId");
		var response = await Mediator.Send(command);

		Assert.True(response.IsSuccess);
	}
}

public class AnotherTest : BaseIntegrationTest
{
	private const string BaseApiAddress = "https://botfatherapi";

	public AnotherTest(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Should_AddBot_Successfully_When_OrganizationExists1()
	{
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;

		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var expectedResponse = new JsonResponse()
		{
			ExpectedResponse = "{\"meetingUrl\":\"FakeMeetId\",\"title\":\"Cando1\"}",
			Method = HttpMethod.Post,
			RequestAddress = BaseApiAddress + "/create-container",
		};

		AddExceptedResponse(expectedResponse);

		var command = new AddBotCommand("GoogleMeet", "Cando", "FakeMeetId");
		var response = await Mediator.Send(command);

		Assert.True(response.IsSuccess);
	}
}
