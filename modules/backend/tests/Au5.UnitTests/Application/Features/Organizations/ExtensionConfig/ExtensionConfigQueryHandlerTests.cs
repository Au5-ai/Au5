using Au5.Application.Common.Options;using Au5.Application.Common.Options;

using Au5.Application.Features.Organizations.ExtensionConfig;using Au5.Application.Features.Organizations.ExtensionConfig;

using Au5.Domain.Entities;using Au5.Domain.Entities;

using MockQueryable.Moq;using MockQueryable.Moq;



namespace Au5.UnitTests.Application.Features.Organizations.ExtensionConfig;namespace Au5.UnitTests.Application.Features.Organizations.ExtensionConfig;



public class ExtensionConfigQueryHandlerTestspublic class ExtensionConfigQueryHandlerTests

{{

	private readonly Mock<IApplicationDbContext> _dbContextMock;	private readonly Mock<IApplicationDbContext> _dbContextMock;

	private readonly Mock<ICurrentUserService> _currentUserServiceMock;	private readonly Mock<IOptions<OrganizationOptions>> _optionsMock;

	private readonly Mock<IOptions<OrganizationOptions>> _optionsMock;	private readonly ExtensionConfigQueryHandler _handler;

	private readonly ExtensionConfigQueryHandler _handler;	private readonly OrganizationOptions _organizationOptions;

	private readonly OrganizationOptions _organizationOptions;

	private readonly Guid _userId;	public ExtensionConfigQueryHandlerTests()

	{

	public ExtensionConfigQueryHandlerTests()		_dbContextMock = new Mock<IApplicationDbContext>();

	{		_optionsMock = new Mock<IOptions<OrganizationOptions>>();

		_dbContextMock = new Mock<IApplicationDbContext>();

		_currentUserServiceMock = new Mock<ICurrentUserService>();		_organizationOptions = new OrganizationOptions

		_optionsMock = new Mock<IOptions<OrganizationOptions>>();		{

		_userId = Guid.NewGuid();			HubUrl = "https://hub.example.com",

			ServiceBaseUrl = "https://api.example.com",

		_organizationOptions = new OrganizationOptions			PanelUrl = "https://panel.example.com"

		{		};

			HubUrl = "https://hub.example.com",

			ServiceBaseUrl = "https://api.example.com",		_optionsMock.Setup(o => o.Value).Returns(_organizationOptions);

			PanelUrl = "https://panel.example.com"

		};		_handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, _optionsMock.Object);

	}

		_optionsMock.Setup(o => o.Value).Returns(_organizationOptions);

		_currentUserServiceMock.Setup(u => u.UserId).Returns(_userId);	[Fact]

	public async Task Should_ReturnError_When_NoOrganizationExists()

		_handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object, _optionsMock.Object);	{

	}		_dbContextMock.Setup(db => db.Set<Organization>())

			.Returns(new List<Organization>().BuildMockDbSet().Object);

	private void SetupOrganizationAndUser(Organization organization, User user)

	{		var query = new ExtensionConfigQuery();

		_dbContextMock.Setup(db => db.Set<Organization>())

			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);		var result = await _handler.Handle(query, CancellationToken.None);



		_dbContextMock.Setup(db => db.Set<User>())		Assert.True(result.IsFailure);

			.Returns(new List<User> { user }.BuildMockDbSet().Object);		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);

	}	}



	[Fact]	[Fact]

	public async Task Should_ReturnError_When_NoOrganizationExists()	public async Task Should_ReturnExtensionConfigResponse_When_OrganizationExists()

	{	{

		_dbContextMock.Setup(db => db.Set<Organization>())		var organization = new Organization

			.Returns(new List<Organization>().BuildMockDbSet().Object);		{

			Id = Guid.NewGuid(),

		var query = new ExtensionConfigQuery();			BotName = "TestBot",

			Direction = "ltr",

		var result = await _handler.Handle(query, CancellationToken.None);			Language = "en"

		};

		Assert.True(result.IsFailure);

		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);		_dbContextMock.Setup(db => db.Set<Organization>())

	}			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);



	[Fact]		var query = new ExtensionConfigQuery();

	public async Task Should_ReturnError_When_UserNotFound()

	{		var result = await _handler.Handle(query, CancellationToken.None);

		var organization = new Organization

		{		Assert.True(result.IsSuccess);

			Id = _userId,		Assert.NotNull(result.Data);

			BotName = "TestBot",		Assert.Equal("TestBot", result.Data.BotName);

			Direction = "ltr",		Assert.Equal("ltr", result.Data.Direction);

			Language = "en"		Assert.Equal("en", result.Data.Language);

		};	}



		_dbContextMock.Setup(db => db.Set<Organization>())	[Fact]

			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);	public async Task Should_MapBotNameFromOrganization_When_ReturningResponse()

	{

		_dbContextMock.Setup(db => db.Set<User>())		var organization = new Organization

			.Returns(new List<User>().BuildMockDbSet().Object);		{

			Id = Guid.NewGuid(),

		var query = new ExtensionConfigQuery();			BotName = "MeetingAssistant",

			Direction = "ltr",

		var result = await _handler.Handle(query, CancellationToken.None);			Language = "en"

		};

		Assert.True(result.IsFailure);

		Assert.Equal(AppResources.User.UserNotFound, result.Error.Description);		_dbContextMock.Setup(db => db.Set<Organization>())

	}			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);



	[Fact]		var query = new ExtensionConfigQuery();

	public async Task Should_ReturnExtensionConfigResponse_When_OrganizationAndUserExist()

	{		var result = await _handler.Handle(query, CancellationToken.None);

		var organization = new Organization

		{		Assert.True(result.IsSuccess);

			Id = _userId,		Assert.Equal("MeetingAssistant", result.Data.BotName);

			BotName = "TestBot",	}

			Direction = "ltr",

			Language = "en"	[Fact]

		};	public async Task Should_MapDirectionFromOrganization_When_ReturningResponse()

	{

		var user = new User		var organization = new Organization

		{		{

			Id = _userId,			Id = Guid.NewGuid(),

			Email = "test@example.com",			BotName = "Bot",

			FullName = "Test User",			Direction = "rtl",

			PictureUrl = "https://example.com/picture.jpg"			Language = "ar"

		};		};



		SetupOrganizationAndUser(organization, user);		_dbContextMock.Setup(db => db.Set<Organization>())

			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);

		Assert.NotNull(result.Data);		Assert.True(result.IsSuccess);

		Assert.Equal("ltr", result.Data.Service.Direction);		Assert.Equal("rtl", result.Data.Direction);

		Assert.Equal("en", result.Data.Service.Language);	}

		Assert.NotNull(result.Data.User);

		Assert.Equal("test@example.com", result.Data.User.Email);	[Fact]

		Assert.Equal("Test User", result.Data.User.FullName);	public async Task Should_MapLanguageFromOrganization_When_ReturningResponse()

	}	{

		var organization = new Organization

	[Fact]		{

	public async Task Should_MapDirectionFromOrganization_When_ReturningResponse()			Id = Guid.NewGuid(),

	{			BotName = "Bot",

		var organization = new Organization			Direction = "ltr",

		{			Language = "fr-FR"

			Id = _userId,		};

			BotName = "Bot",

			Direction = "rtl",		_dbContextMock.Setup(db => db.Set<Organization>())

			Language = "ar"			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		};

		var query = new ExtensionConfigQuery();

		var user = new User

		{		var result = await _handler.Handle(query, CancellationToken.None);

			Id = _userId,

			Email = "user@example.com",		Assert.True(result.IsSuccess);

			FullName = "Test User",		Assert.Equal("fr-FR", result.Data.Language);

			PictureUrl = "https://example.com/picture.jpg"	}

		};

	[Fact]

		SetupOrganizationAndUser(organization, user);	public async Task Should_MapHubUrlFromOptions_When_ReturningResponse()

	{

		var query = new ExtensionConfigQuery();		var organization = new Organization

		{

		var result = await _handler.Handle(query, CancellationToken.None);			Id = Guid.NewGuid(),

			BotName = "Bot",

		Assert.True(result.IsSuccess);			Direction = "ltr",

		Assert.Equal("rtl", result.Data.Service.Direction);			Language = "en"

	}		};



	[Fact]		_dbContextMock.Setup(db => db.Set<Organization>())

	public async Task Should_MapLanguageFromOrganization_When_ReturningResponse()			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

	{

		var organization = new Organization		var query = new ExtensionConfigQuery();

		{

			Id = _userId,		var result = await _handler.Handle(query, CancellationToken.None);

			BotName = "Bot",

			Direction = "ltr",		Assert.True(result.IsSuccess);

			Language = "fr-FR"		Assert.Equal("https://hub.example.com", result.Data.HubUrl);

		};	}



		var user = new User	[Fact]

		{	public async Task Should_MapServiceBaseUrlFromOptions_When_ReturningResponse()

			Id = _userId,	{

			Email = "user@example.com",		var organization = new Organization

			FullName = "Test User",		{

			PictureUrl = "https://example.com/picture.jpg"			Id = Guid.NewGuid(),

		};			BotName = "Bot",

			Direction = "ltr",

		SetupOrganizationAndUser(organization, user);			Language = "en"

		};

		var query = new ExtensionConfigQuery();

		_dbContextMock.Setup(db => db.Set<Organization>())

		var result = await _handler.Handle(query, CancellationToken.None);			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);



		Assert.True(result.IsSuccess);		var query = new ExtensionConfigQuery();

		Assert.Equal("fr-FR", result.Data.Service.Language);

	}		var result = await _handler.Handle(query, CancellationToken.None);



	[Fact]		Assert.True(result.IsSuccess);

	public async Task Should_MapHubUrlFromOptions_When_ReturningResponse()		Assert.Equal("https://api.example.com", result.Data.ServiceBaseUrl);

	{	}

		var organization = new Organization

		{	[Fact]

			Id = _userId,	public async Task Should_MapPanelUrlFromOptions_When_ReturningResponse()

			BotName = "Bot",	{

			Direction = "ltr",		var organization = new Organization

			Language = "en"		{

		};			Id = Guid.NewGuid(),

			BotName = "Bot",

		var user = new User			Direction = "ltr",

		{			Language = "en"

			Id = _userId,		};

			Email = "user@example.com",

			FullName = "Test User",		_dbContextMock.Setup(db => db.Set<Organization>())

			PictureUrl = "https://example.com/picture.jpg"			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		};

		var query = new ExtensionConfigQuery();

		SetupOrganizationAndUser(organization, user);

		var result = await _handler.Handle(query, CancellationToken.None);

		var query = new ExtensionConfigQuery();

		Assert.True(result.IsSuccess);

		var result = await _handler.Handle(query, CancellationToken.None);		Assert.Equal("https://panel.example.com", result.Data.PanelUrl);

	}

		Assert.True(result.IsSuccess);

		Assert.Equal("https://hub.example.com", result.Data.Service.HubUrl);	[Fact]

	}	public async Task Should_CombineOrganizationAndOptionsData_When_ReturningResponse()

	{

	[Fact]		var organization = new Organization

	public async Task Should_MapServiceBaseUrlFromOptions_When_ReturningResponse()		{

	{			Id = Guid.NewGuid(),

		var organization = new Organization			BotName = "CompleteBot",

		{			Direction = "ltr",

			Id = _userId,			Language = "en-US"

			BotName = "Bot",		};

			Direction = "ltr",

			Language = "en"		_dbContextMock.Setup(db => db.Set<Organization>())

		};			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);



		var user = new User		var query = new ExtensionConfigQuery();

		{

			Id = _userId,		var result = await _handler.Handle(query, CancellationToken.None);

			Email = "user@example.com",

			FullName = "Test User",		Assert.True(result.IsSuccess);

			PictureUrl = "https://example.com/picture.jpg"		var response = result.Data;

		};		Assert.NotNull(response);

		Assert.Equal("CompleteBot", response.BotName);

		SetupOrganizationAndUser(organization, user);		Assert.Equal("ltr", response.Direction);

		Assert.Equal("en-US", response.Language);

		var query = new ExtensionConfigQuery();		Assert.Equal("https://hub.example.com", response.HubUrl);

		Assert.Equal("https://api.example.com", response.ServiceBaseUrl);

		var result = await _handler.Handle(query, CancellationToken.None);		Assert.Equal("https://panel.example.com", response.PanelUrl);

	}

		Assert.True(result.IsSuccess);

		Assert.Equal("https://api.example.com", result.Data.Service.ServiceBaseUrl);	[Fact]

	}	public async Task Should_UseDifferentOptionValues_When_OptionsChanged()

	{

	[Fact]		var differentOptions = new OrganizationOptions

	public async Task Should_MapPanelUrlFromOptions_When_ReturningResponse()		{

	{			HubUrl = "https://hub2.example.com",

		var organization = new Organization			ServiceBaseUrl = "https://api2.example.com",

		{			PanelUrl = "https://panel2.example.com"

			Id = _userId,		};

			BotName = "Bot",

			Direction = "ltr",		var optionsMock = new Mock<IOptions<OrganizationOptions>>();

			Language = "en"		optionsMock.Setup(o => o.Value).Returns(differentOptions);

		};

		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, optionsMock.Object);

		var user = new User

		{		var organization = new Organization

			Id = _userId,		{

			Email = "user@example.com",			Id = Guid.NewGuid(),

			FullName = "Test User",			BotName = "Bot",

			PictureUrl = "https://example.com/picture.jpg"			Direction = "ltr",

		};			Language = "en"

		};

		SetupOrganizationAndUser(organization, user);

		_dbContextMock.Setup(db => db.Set<Organization>())

		var query = new ExtensionConfigQuery();			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);



		var result = await _handler.Handle(query, CancellationToken.None);		var query = new ExtensionConfigQuery();



		Assert.True(result.IsSuccess);		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Equal("https://panel.example.com", result.Data.Service.PanelUrl);

	}		Assert.True(result.IsSuccess);

		Assert.Equal("https://hub2.example.com", result.Data.HubUrl);

	[Fact]		Assert.Equal("https://api2.example.com", result.Data.ServiceBaseUrl);

	public async Task Should_MapUserInformation_When_ReturningResponse()		Assert.Equal("https://panel2.example.com", result.Data.PanelUrl);

	{	}

		var organization = new Organization

		{	[Fact]

			Id = _userId,	public async Task Should_ReturnFirstOrganization_When_MultipleOrganizationsExist()

			BotName = "Bot",	{

			Direction = "ltr",		var organization1 = new Organization

			Language = "en"		{

		};			Id = Guid.NewGuid(),

			BotName = "FirstBot",

		var user = new User			Direction = "ltr",

		{			Language = "en"

			Id = _userId,		};

			Email = "complete@example.com",

			FullName = "Complete User",		var organization2 = new Organization

			PictureUrl = "https://example.com/user.jpg"		{

		};			Id = Guid.NewGuid(),

			BotName = "SecondBot",

		SetupOrganizationAndUser(organization, user);			Direction = "rtl",

			Language = "ar"

		var query = new ExtensionConfigQuery();		};



		var result = await _handler.Handle(query, CancellationToken.None);		_dbContextMock.Setup(db => db.Set<Organization>())

			.Returns(new List<Organization> { organization1, organization2 }.BuildMockDbSet().Object);

		Assert.True(result.IsSuccess);

		Assert.NotNull(result.Data.User);		var query = new ExtensionConfigQuery();

		Assert.Equal(_userId, result.Data.User.Id);

		Assert.Equal("complete@example.com", result.Data.User.Email);		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.Equal("Complete User", result.Data.User.FullName);

		Assert.Equal("https://example.com/user.jpg", result.Data.User.PictureUrl);		Assert.True(result.IsSuccess);

	}		Assert.Equal("FirstBot", result.Data.BotName);

	}

	[Fact]

	public async Task Should_CombineOrganizationUserAndOptionsData_When_ReturningResponse()	[Fact]

	{	public async Task Should_PassCancellationToken_When_QueryingDatabase()

		var organization = new Organization	{

		{		using var cts = new CancellationTokenSource();

			Id = _userId,		var cancellationToken = cts.Token;

			BotName = "CompleteBot",

			Direction = "ltr",		_dbContextMock.Setup(db => db.Set<Organization>())

			Language = "en-US"			.Returns(new List<Organization>().BuildMockDbSet().Object);

		};

		var query = new ExtensionConfigQuery();

		var user = new User

		{		await _handler.Handle(query, cancellationToken);

			Id = _userId,

			Email = "test@example.com",		_dbContextMock.Verify(db => db.Set<Organization>(), Times.Once);

			FullName = "Complete User",	}

			PictureUrl = "https://example.com/pic.jpg"

		};	[Fact]

	public async Task Should_HandleNullOptionUrls_When_OptionsNotConfigured()

		SetupOrganizationAndUser(organization, user);	{

		var nullOptions = new OrganizationOptions

		var query = new ExtensionConfigQuery();		{

			HubUrl = null,

		var result = await _handler.Handle(query, CancellationToken.None);			ServiceBaseUrl = null,

			PanelUrl = null

		Assert.True(result.IsSuccess);		};

		var response = result.Data;

		Assert.NotNull(response);		var optionsMock = new Mock<IOptions<OrganizationOptions>>();

		Assert.NotNull(response.Service);		optionsMock.Setup(o => o.Value).Returns(nullOptions);

		Assert.NotNull(response.User);

		Assert.Equal("ltr", response.Service.Direction);		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, optionsMock.Object);

		Assert.Equal("en-US", response.Service.Language);

		Assert.Equal("https://hub.example.com", response.Service.HubUrl);		var organization = new Organization

		Assert.Equal("https://api.example.com", response.Service.ServiceBaseUrl);		{

		Assert.Equal("https://panel.example.com", response.Service.PanelUrl);			Id = Guid.NewGuid(),

		Assert.Equal("test@example.com", response.User.Email);			BotName = "Bot",

		Assert.Equal("Complete User", response.User.FullName);			Direction = "ltr",

	}			Language = "en"

		};

	[Fact]

	public async Task Should_UseDifferentOptionValues_When_OptionsChanged()		_dbContextMock.Setup(db => db.Set<Organization>())

	{			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		var differentOptions = new OrganizationOptions

		{		var query = new ExtensionConfigQuery();

			HubUrl = "https://hub2.example.com",

			ServiceBaseUrl = "https://api2.example.com",		var result = await handler.Handle(query, CancellationToken.None);

			PanelUrl = "https://panel2.example.com"

		};		Assert.True(result.IsSuccess);

		Assert.Null(result.Data.HubUrl);

		var optionsMock = new Mock<IOptions<OrganizationOptions>>();		Assert.Null(result.Data.ServiceBaseUrl);

		optionsMock.Setup(o => o.Value).Returns(differentOptions);		Assert.Null(result.Data.PanelUrl);

	}

		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object, optionsMock.Object);}


		var organization = new Organization
		{
			Id = _userId,
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		var user = new User
		{
			Id = _userId,
			Email = "user@example.com",
			FullName = "Test User",
			PictureUrl = "https://example.com/picture.jpg"
		};

		SetupOrganizationAndUser(organization, user);

		var query = new ExtensionConfigQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("https://hub2.example.com", result.Data.Service.HubUrl);
		Assert.Equal("https://api2.example.com", result.Data.Service.ServiceBaseUrl);
		Assert.Equal("https://panel2.example.com", result.Data.Service.PanelUrl);
	}

	[Fact]
	public async Task Should_UseCurrentUserOrganization_When_ReturningResponse()
	{
		var differentUserId = Guid.NewGuid();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		currentUserServiceMock.Setup(u => u.UserId).Returns(differentUserId);

		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, currentUserServiceMock.Object, _optionsMock.Object);

		var organization1 = new Organization
		{
			Id = _userId,
			BotName = "FirstBot",
			Direction = "ltr",
			Language = "en"
		};

		var organization2 = new Organization
		{
			Id = differentUserId,
			BotName = "SecondBot",
			Direction = "rtl",
			Language = "ar"
		};

		var user1 = new User
		{
			Id = _userId,
			Email = "first@example.com",
			FullName = "First User",
			PictureUrl = "https://example.com/first.jpg"
		};

		var user2 = new User
		{
			Id = differentUserId,
			Email = "second@example.com",
			FullName = "Second User",
			PictureUrl = "https://example.com/second.jpg"
		};

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization1, organization2 }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user1, user2 }.BuildMockDbSet().Object);

		var query = new ExtensionConfigQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("rtl", result.Data.Service.Direction);
		Assert.Equal("ar", result.Data.Service.Language);
		Assert.Equal("second@example.com", result.Data.User.Email);
		Assert.Equal("Second User", result.Data.User.FullName);
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

		var handler = new ExtensionConfigQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object, optionsMock.Object);

		var organization = new Organization
		{
			Id = _userId,
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		var user = new User
		{
			Id = _userId,
			Email = "user@example.com",
			FullName = "Test User",
			PictureUrl = "https://example.com/picture.jpg"
		};

		SetupOrganizationAndUser(organization, user);

		var query = new ExtensionConfigQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Null(result.Data.Service.HubUrl);
		Assert.Null(result.Data.Service.ServiceBaseUrl);
		Assert.Null(result.Data.Service.PanelUrl);
	}

	[Fact]
	public async Task Should_HandleUserWithNullPictureUrl_When_ReturningResponse()
	{
		var organization = new Organization
		{
			Id = _userId,
			BotName = "Bot",
			Direction = "ltr",
			Language = "en"
		};

		var user = new User
		{
			Id = _userId,
			Email = "user@example.com",
			FullName = "Test User",
			PictureUrl = null
		};

		SetupOrganizationAndUser(organization, user);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data.User);
		Assert.Null(result.Data.User.PictureUrl);
		Assert.Equal("user@example.com", result.Data.User.Email);
		Assert.Equal("Test User", result.Data.User.FullName);
	}
}
