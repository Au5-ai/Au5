using Au5.Application.Common.Abstractions;
using Au5.Application.Features.SystemConfigs.SetConfig;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.SystemConfiguration;

public class SystemConfigCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly SystemConfigCommandHandler _handler;

	public SystemConfigCommandHandlerTests()
	{
		_dbContextMock = new();
		_handler = new SystemConfigCommandHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_UpdatesConfigAndReturnsSuccess_When_ExistingConfig()
	{
		var config = new SystemConfig { Id = Guid.NewGuid() };

		var dbSet = new List<SystemConfig> { config }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new SystemConfigCommand()
		{
			OrganizationName = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Null(result.Error.Description);
		Assert.Equal("TestOrg", config.OrganizationName);
		Assert.Equal("Bot", config.BotName);
		Assert.Equal("http=//hub", config.HubUrl);
		Assert.Equal("Inbound", config.Direction);
		Assert.Equal("en", config.Language);
		Assert.Equal("http=//service", config.ServiceBaseUrl);
		Assert.Equal("http=//panel", config.PanelUrl);
		Assert.Equal("token", config.OpenAIToken);
		dbSet.Verify(x => x.Add(It.IsAny<SystemConfig>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_AddsNewConfigAndReturnsSuccess_When_NoExistingConfig()
	{
		var dbSet = new List<SystemConfig> { }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new SystemConfigCommand
		{
			OrganizationName = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		dbSet.Verify(x => x.Add(It.IsAny<SystemConfig>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		Assert.True(result.IsSuccess);
		Assert.Null(result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnsFailure_When_SaveChangesFails()
	{
		var dbSet = new List<SystemConfig> { }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			   .ReturnsAsync(Error.Failure(description: "Failed To Config Company"));

		var command = new SystemConfigCommand
		{
			OrganizationName = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		dbSet.Verify(x => x.Add(It.IsAny<SystemConfig>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.System.FailedToConfig, result.Error.Description);
	}
}
