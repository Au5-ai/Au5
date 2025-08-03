using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Org.Config;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Org;

public class ConfigOrganizationCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly ConfigOrganizationCommandHandler _handler;

	public ConfigOrganizationCommandHandlerTests()
	{
		_dbContextMock = new();
		_handler = new ConfigOrganizationCommandHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_ExistingConfigAndForceUpdateFalse()
	{
		var org = new Organization { Id = Guid.NewGuid() };

		var dbSet = new List<Organization> { org }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		var command = new ConfigOrganizationCommand()
		{
			Name = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
			ForceUpdate = false
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.OrganizationAlreadyConfigured, result.Error.Description);
	}

	[Fact]
	public async Task Should_UpdatesConfigAndReturnsSuccess_When_ExistingConfigForceUpdateTrue()
	{
		var org = new Organization { Id = Guid.NewGuid() };

		var dbSet = new List<Organization> { org }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new ConfigOrganizationCommand()
		{
			Name = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
			ForceUpdate = true
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Null(result.Error.Description);
		Assert.Equal("TestOrg", org.Name);
		Assert.Equal("Bot", org.BotName);
		Assert.Equal("http=//hub", org.HubUrl);
		Assert.Equal("Inbound", org.Direction);
		Assert.Equal("en", org.Language);
		Assert.Equal("http=//service", org.ServiceBaseUrl);
		Assert.Equal("http=//panel", org.PanelUrl);
		Assert.Equal("token", org.OpenAIToken);
		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_AddsNewConfigAndReturnsSuccess_When_NoExistingConfig()
	{
		var dbSet = new List<Organization> { }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new ConfigOrganizationCommand
		{
			Name = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
			ForceUpdate = false
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		Assert.True(result.IsSuccess);
		Assert.Null(result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnsFailure_When_SaveChangesFails()
	{
		var dbSet = new List<Organization> { }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			   .ReturnsAsync(Error.Failure(description: "Failed To Config Company"));

		var command = new ConfigOrganizationCommand
		{
			Name = "TestOrg",
			BotName = "Bot",
			HubUrl = "http=//hub",
			Direction = "Inbound",
			Language = "en",
			ServiceBaseUrl = "http=//service",
			PanelUrl = "http=//panel",
			OpenAIToken = "token",
			ForceUpdate = false
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.FailedToConfigOrganization, result.Error.Description);
	}
}
