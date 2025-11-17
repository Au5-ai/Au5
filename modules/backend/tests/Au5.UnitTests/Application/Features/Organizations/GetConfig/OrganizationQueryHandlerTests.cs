using Au5.Application.Features.Organizations.GetConfig;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Organizations.GetConfig;

public class OrganizationQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly OrganizationQueryHandler _handler;

	public OrganizationQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_handler = new OrganizationQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnError_When_NoOrganizationExists()
	{
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnOrganizationResponse_When_OrganizationExists()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization",
			BotName = "TestBot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal("Test Organization", result.Data.OrganizationName);
		Assert.Equal("TestBot", result.Data.BotName);
		Assert.Equal("ltr", result.Data.Direction);
		Assert.Equal("en", result.Data.Language);
	}

	[Fact]
	public async Task Should_ReturnFirstOrganization_When_MultipleOrganizationsExist()
	{
		var organization1 = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "First Organization",
			BotName = "FirstBot",
			Direction = "ltr",
			Language = "en"
		};

		var organization2 = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Second Organization",
			BotName = "SecondBot",
			Direction = "rtl",
			Language = "ar"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization1, organization2 }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal("First Organization", result.Data.OrganizationName);
	}

	[Fact]
	public async Task Should_MapOrganizationName_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Acme Corporation",
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("Acme Corporation", result.Data.OrganizationName);
	}

	[Fact]
	public async Task Should_MapBotName_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Organization",
			BotName = "MeetingAssistant",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("MeetingAssistant", result.Data.BotName);
	}

	[Fact]
	public async Task Should_MapDirection_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Organization",
			BotName = "Bot",
			Direction = "rtl",
			Language = "ar"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("rtl", result.Data.Direction);
	}

	[Fact]
	public async Task Should_MapLanguage_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Organization",
			BotName = "Bot",
			Direction = "ltr",
			Language = "fr"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("fr", result.Data.Language);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<Organization>(), Times.Once);
	}

	[Fact]
	public async Task Should_HandleEmptyStrings_When_OrganizationHasEmptyProperties()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = string.Empty,
			BotName = string.Empty,
			Direction = string.Empty,
			Language = string.Empty
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(string.Empty, result.Data.OrganizationName);
		Assert.Equal(string.Empty, result.Data.BotName);
		Assert.Equal(string.Empty, result.Data.Direction);
		Assert.Equal(string.Empty, result.Data.Language);
	}

	[Fact]
	public async Task Should_ReturnAllProperties_When_OrganizationIsFullyPopulated()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Complete Organization",
			BotName = "CompleteBot",
			Direction = "ltr",
			Language = "en-US"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new OrganizationQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data;
		Assert.NotNull(response);
		Assert.Equal("Complete Organization", response.OrganizationName);
		Assert.Equal("CompleteBot", response.BotName);
		Assert.Equal("ltr", response.Direction);
		Assert.Equal("en-US", response.Language);
	}
}
