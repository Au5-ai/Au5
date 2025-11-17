using Au5.Application.Features.Organizations.SetConfig;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Organizations;

public class OrganizationCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly OrganizationCommandHandler _handler;

	public OrganizationCommandHandlerTests()
	{
		_dbContextMock = new();
		_handler = new OrganizationCommandHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_UpdatesConfigAndReturnsSuccess_When_ExistingConfig()
	{
		var config = new Organization { Id = Guid.NewGuid() };

		var dbSet = new List<Organization> { config }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new OrganizationCommand()
		{
			OrganizationName = "TestOrg",
			BotName = "Bot",
			Direction = "Inbound",
			Language = "en",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Null(result.Error.Description);
		Assert.Equal("TestOrg", config.OrganizationName);
		Assert.Equal("Bot", config.BotName);
		Assert.Equal("Inbound", config.Direction);
		Assert.Equal("en", config.Language);
		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnUnauthorized_When_OrganizationNotFound()
	{
		var dbSet = new List<Organization> { }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		var command = new OrganizationCommand
		{
			OrganizationName = "TestOrg",
			BotName = "Bot",
			Direction = "Inbound",
			Language = "en",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(System.Net.HttpStatusCode.Unauthorized, result.Error.Type);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnsFailure_When_SaveChangesFails()
	{
		var existingConfig = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "OldOrg",
			BotName = "OldBot",
			Direction = "Outbound",
			Language = "ar",
		};

		var dbSet = new List<Organization> { existingConfig }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			   .ReturnsAsync(Error.Failure(description: "Failed To Config Company"));

		var command = new OrganizationCommand
		{
			OrganizationName = "TestOrg",
			BotName = "Bot",
			Direction = "Inbound",
			Language = "en",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.System.FailedToConfig, result.Error.Description);
	}

	[Fact]
	public async Task Should_UpdateAllProperties_When_ValidCommand()
	{
		var existingConfig = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "OldOrg",
			BotName = "OldBot",
			Direction = "Outbound",
			Language = "ar",
		};

		var dbSet = new List<Organization> { existingConfig }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new OrganizationCommand
		{
			OrganizationName = "NewOrg",
			BotName = "NewBot",
			Direction = "Inbound",
			Language = "en",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("NewOrg", existingConfig.OrganizationName);
		Assert.Equal("NewBot", existingConfig.BotName);
		Assert.Equal("Inbound", existingConfig.Direction);
		Assert.Equal("en", existingConfig.Language);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_OnlyUpdateOrganization_When_MultipleEntitiesExist()
	{
		var targetConfig = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "TargetOrg",
			BotName = "TargetBot",
			Direction = "Outbound",
			Language = "ar",
		};

		var dbSet = new List<Organization> { targetConfig }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new OrganizationCommand
		{
			OrganizationName = "UpdatedOrg",
			BotName = "UpdatedBot",
			Direction = "Inbound",
			Language = "en",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("UpdatedOrg", targetConfig.OrganizationName);
		Assert.Equal("UpdatedBot", targetConfig.BotName);
		dbSet.Verify(x => x.Add(It.IsAny<Organization>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_AllFieldsProvidedCorrectly()
	{
		var existingConfig = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test",
			BotName = "Test",
			Direction = "Outbound",
			Language = "ar",
		};

		var dbSet = new List<Organization> { existingConfig }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(dbSet.Object);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new OrganizationCommand
		{
			OrganizationName = "Full Test Org",
			BotName = "Full Test Bot",
			Direction = "Bidirectional",
			Language = "fr",
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Null(result.Error.Description);
		Assert.Equal("Full Test Org", existingConfig.OrganizationName);
		Assert.Equal("Full Test Bot", existingConfig.BotName);
		Assert.Equal("Bidirectional", existingConfig.Direction);
		Assert.Equal("fr", existingConfig.Language);
	}
}
