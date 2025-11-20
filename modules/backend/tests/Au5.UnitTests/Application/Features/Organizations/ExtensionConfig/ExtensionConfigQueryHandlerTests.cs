using System.Net;
using Au5.Application.Common.Options;
using Au5.Application.Features.Organizations.ExtensionConfig;
using Au5.Domain.Entities;
using MockQueryable.Moq;
using static Au5.UnitTests.Application.AppResources;
using UserEntity = Au5.Domain.Entities.User;

namespace Au5.UnitTests.Application.Features.Organizations.ExtensionConfig;

public class ExtensionConfigQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<IOptions<OrganizationOptions>> _organizationOptionsMock;
	private readonly ExtensionConfigQueryHandler _handler;

	public ExtensionConfigQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_organizationOptionsMock = new Mock<IOptions<OrganizationOptions>>();

		var organizationOptions = new OrganizationOptions
		{
			HubUrl = "https://hub.example.com",
			ServiceBaseUrl = "https://api.example.com",
			PanelUrl = "https://panel.example.com"
		};

		_organizationOptionsMock.Setup(x => x.Value).Returns(organizationOptions);

		_handler = new ExtensionConfigQueryHandler(
			_dbContextMock.Object,
			_currentUserServiceMock.Object,
			_organizationOptionsMock.Object);
	}

	[Fact]
	public async Task Should_ReturnExtensionConfigResponse_When_OrganizationAndUserExist()
	{
		var organizationId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var organization = new Organization
		{
			Id = organizationId,
			Direction = "Inbound",
			Language = "en"
		};

		var user = new UserEntity
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			PictureUrl = "https://example.com/pic.jpg"
		};

		var organizationDbSet = new List<Organization> { organization }.BuildMockDbSet();
		var userDbSet = new List<UserEntity> { user }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(db => db.Set<UserEntity>()).Returns(userDbSet.Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.NotNull(result.Data.Service);
		Assert.NotNull(result.Data.User);
		Assert.Equal("Inbound", result.Data.Service.Direction);
		Assert.Equal("en", result.Data.Service.Language);
		Assert.Equal("https://hub.example.com", result.Data.Service.HubUrl);
		Assert.Equal("https://api.example.com", result.Data.Service.ServiceBaseUrl);
		Assert.Equal("https://panel.example.com", result.Data.Service.PanelUrl);
		Assert.Equal(userId, result.Data.User.Id);
		Assert.Equal("test@example.com", result.Data.User.Email);
		Assert.Equal("Test User", result.Data.User.FullName);
		Assert.Equal("https://example.com/pic.jpg", result.Data.User.PictureUrl);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_OrganizationNotFound()
	{
		var organizationId = Guid.NewGuid();

		var organizationDbSet = new List<Organization> { }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(organizationDbSet.Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnUnauthorized_When_UserNotFound()
	{
		var organizationId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var organization = new Organization
		{
			Id = organizationId,
			Direction = "Outbound",
			Language = "ar"
		};

		var organizationDbSet = new List<Organization> { organization }.BuildMockDbSet();
		var userDbSet = new List<UserEntity> { }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(db => db.Set<UserEntity>()).Returns(userDbSet.Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
		Assert.Equal(UserMessages.UserNotFound, result.Error.Description);
	}

	[Fact]
	public async Task Should_HandleMultipleOrganizations_When_FilteringByCurrentUserOrganizationId()
	{
		var organizationId1 = Guid.NewGuid();
		var organizationId2 = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var organization1 = new Organization
		{
			Id = organizationId1,
			Direction = "Inbound",
			Language = "en"
		};

		var organization2 = new Organization
		{
			Id = organizationId2,
			Direction = "Outbound",
			Language = "ar"
		};

		var user = new UserEntity
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			PictureUrl = "https://example.com/pic.jpg"
		};

		var organizationDbSet = new List<Organization> { organization1, organization2 }.BuildMockDbSet();
		var userDbSet = new List<UserEntity> { user }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId1);
		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(db => db.Set<UserEntity>()).Returns(userDbSet.Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal("Inbound", result.Data.Service.Direction);
		Assert.Equal("en", result.Data.Service.Language);
	}

	[Fact]
	public async Task Should_HandleMultipleUsers_When_FilteringByCurrentUserId()
	{
		var organizationId = Guid.NewGuid();
		var userId1 = Guid.NewGuid();
		var userId2 = Guid.NewGuid();

		var organization = new Organization
		{
			Id = organizationId,
			Direction = "Inbound",
			Language = "en"
		};

		var user1 = new UserEntity
		{
			Id = userId1,
			Email = "user1@example.com",
			FullName = "User One",
			PictureUrl = "https://example.com/pic1.jpg"
		};

		var user2 = new UserEntity
		{
			Id = userId2,
			Email = "user2@example.com",
			FullName = "User Two",
			PictureUrl = "https://example.com/pic2.jpg"
		};

		var organizationDbSet = new List<Organization> { organization }.BuildMockDbSet();
		var userDbSet = new List<UserEntity> { user1, user2 }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId1);

		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(db => db.Set<UserEntity>()).Returns(userDbSet.Object);

		var query = new ExtensionConfigQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(userId1, result.Data.User.Id);
		Assert.Equal("user1@example.com", result.Data.User.Email);
		Assert.Equal("User One", result.Data.User.FullName);
	}

	[Fact]
	public async Task Should_ReturnConfigWithOrganizationOptions_When_OptionsAreConfigured()
	{
		var organizationId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var organization = new Organization
		{
			Id = organizationId,
			Direction = "Bidirectional",
			Language = "fr"
		};

		var user = new UserEntity
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			PictureUrl = "https://example.com/pic.jpg"
		};

		var customOptions = new OrganizationOptions
		{
			HubUrl = "https://custom-hub.com",
			ServiceBaseUrl = "https://custom-api.com",
			PanelUrl = "https://custom-panel.com"
		};

		_organizationOptionsMock.Setup(x => x.Value).Returns(customOptions);

		var handler = new ExtensionConfigQueryHandler(
			_dbContextMock.Object,
			_currentUserServiceMock.Object,
			_organizationOptionsMock.Object);

		var organizationDbSet = new List<Organization> { organization }.BuildMockDbSet();
		var userDbSet = new List<UserEntity> { user }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(db => db.Set<UserEntity>()).Returns(userDbSet.Object);

		var query = new ExtensionConfigQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal("https://custom-hub.com", result.Data.Service.HubUrl);
		Assert.Equal("https://custom-api.com", result.Data.Service.ServiceBaseUrl);
		Assert.Equal("https://custom-panel.com", result.Data.Service.PanelUrl);
		Assert.Equal("Bidirectional", result.Data.Service.Direction);
		Assert.Equal("fr", result.Data.Service.Language);
	}
}
