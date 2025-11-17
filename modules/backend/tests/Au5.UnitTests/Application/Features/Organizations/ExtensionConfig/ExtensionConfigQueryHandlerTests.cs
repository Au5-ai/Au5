using Au5.Application.Common.Options;
using Au5.Application.Features.Organizations.ExtensionConfig;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Organizations.ExtensionConfig;

public class ExtensionConfigQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IOptions<OrganizationOptions>> _optionsMock;
	private readonly ExtensionConfigQueryHandler _handler;
	private readonly OrganizationOptions _organizationOptions;

	public ExtensionConfigQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_optionsMock = new Mock<IOptions<OrganizationOptions>>();

		_organizationOptions = new OrganizationOptions
		{
			HubUrl = "https://hub.example.com",
			ServiceBaseUrl = "https://api.example.com",
			PanelUrl = "https://panel.example.com"
		};

		_optionsMock.Setup(o => o.Value).Returns(_organizationOptions);

		_handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, _optionsMock.Object);
	}

	[Fact]
	public async Task Should_ReturnError_When_NoOrganizationExists()
	{
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnExtensionConfigResponse_When_OrganizationExists()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal("TestBot", result.Data.BotName);
		Assert.Equal("ltr", result.Data.Direction);
		Assert.Equal("en", result.Data.Language);
	}

	[Fact]
	public async Task Should_MapBotNameFromOrganization_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "MeetingAssistant",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("MeetingAssistant", result.Data.BotName);
	}

	[Fact]
	public async Task Should_MapDirectionFromOrganization_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "rtl",
			Language = "ar"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("rtl", result.Data.Direction);
	}

	[Fact]
	public async Task Should_MapLanguageFromOrganization_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "ltr",
			Language = "fr-FR"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("fr-FR", result.Data.Language);
	}

	[Fact]
	public async Task Should_MapHubUrlFromOptions_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("https://hub.example.com", result.Data.HubUrl);
	}

	[Fact]
	public async Task Should_MapServiceBaseUrlFromOptions_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("https://api.example.com", result.Data.ServiceBaseUrl);
	}

	[Fact]
	public async Task Should_MapPanelUrlFromOptions_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("https://panel.example.com", result.Data.PanelUrl);
	}

	[Fact]
	public async Task Should_CombineOrganizationAndOptionsData_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "CompleteBot",
			Direction = "ltr",
			Language = "en-US"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data;
		Assert.NotNull(response);
		Assert.Equal("CompleteBot", response.BotName);
		Assert.Equal("ltr", response.Direction);
		Assert.Equal("en-US", response.Language);
		Assert.Equal("https://hub.example.com", response.HubUrl);
		Assert.Equal("https://api.example.com", response.ServiceBaseUrl);
		Assert.Equal("https://panel.example.com", response.PanelUrl);
	}

	[Fact]
	public async Task Should_UseDifferentOptionValues_When_OptionsChanged()
	{
		var differentOptions = new OrganizationOptions
		{
			HubUrl = "https://hub2.example.com",
			ServiceBaseUrl = "https://api2.example.com",
			PanelUrl = "https://panel2.example.com"
		};

		var optionsMock = new Mock<IOptions<OrganizationOptions>>();
		optionsMock.Setup(o => o.Value).Returns(differentOptions);

		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, optionsMock.Object);

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("https://hub2.example.com", result.Data.HubUrl);
		Assert.Equal("https://api2.example.com", result.Data.ServiceBaseUrl);
		Assert.Equal("https://panel2.example.com", result.Data.PanelUrl);
	}

	[Fact]
	public async Task Should_ReturnFirstOrganization_When_MultipleOrganizationsExist()
	{
		var organization1 = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "FirstBot",
			Direction = "ltr",
			Language = "en"
		};

		var organization2 = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "SecondBot",
			Direction = "rtl",
			Language = "ar"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization1, organization2 }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("FirstBot", result.Data.BotName);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<Organization>(), Times.Once);
	}

	[Fact]
	public async Task Should_HandleNullOptionUrls_When_OptionsNotConfigured()
	{
		var nullOptions = new OrganizationOptions
		{
			HubUrl = null,
			ServiceBaseUrl = null,
			PanelUrl = null
		};

		var optionsMock = new Mock<IOptions<OrganizationOptions>>();
		optionsMock.Setup(o => o.Value).Returns(nullOptions);

		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, optionsMock.Object);

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Null(result.Data.HubUrl);
		Assert.Null(result.Data.ServiceBaseUrl);
		Assert.Null(result.Data.PanelUrl);
	}
}
