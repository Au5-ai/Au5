using Au5.Application.Dtos.AI;
using Au5.Application.Features.Assistants.AddAssistant;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Assistants;
public class AddAssistantCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnId_When_ValidRequest()
	{
		List<SystemConfig> config = [new SystemConfig() { AIProviderUrl = "URL" }];
		var configDbSetMock = config.BuildMockDbSet();
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineAdapterMock = new Mock<IAIEngineAdapter>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();

		aiEngineAdapterMock.Setup(x => x.CreateAssistantAsync(It.IsAny<string>(), It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Au5.Shared.Result.Success());

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineAdapterMock.Object, currentUserServiceMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotEqual(Guid.Empty, result.Data.Id);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		List<SystemConfig> config = [new SystemConfig() { AIProviderUrl = "URL" }];
		var configDbSetMock = config.BuildMockDbSet();
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineAdapterMock = new Mock<IAIEngineAdapter>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();

		aiEngineAdapterMock.Setup(x => x.CreateAssistantAsync(It.IsAny<string>(), It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Au5.Shared.Result.Failure(Au5.Shared.Error.Failure(description: "fail")));

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineAdapterMock.Object, currentUserServiceMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.DatabaseFailureMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_OpenAIConnectionFailed()
	{
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		List<SystemConfig> config = [new SystemConfig() { AIProviderUrl = "URL" }];
		var configDbSetMock = config.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineAdapterMock = new Mock<IAIEngineAdapter>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();

		currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
		aiEngineAdapterMock.Setup(x => x.CreateAssistantAsync(It.IsAny<string>(), It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync(string.Empty);
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(configDbSetMock.Object);
		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineAdapterMock.Object, currentUserServiceMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.Assistant.OpenAIConnectionFailed, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_ConfigIsNotExist()
	{
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		List<SystemConfig> config = [];
		var configDbSetMock = config.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineAdapterMock = new Mock<IAIEngineAdapter>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();

		currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
		aiEngineAdapterMock.Setup(x => x.CreateAssistantAsync(It.IsAny<string>(), It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync(string.Empty);
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(configDbSetMock.Object);
		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineAdapterMock.Object, currentUserServiceMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
	}
}
