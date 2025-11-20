using Au5.Application.Common.Options;
using Au5.Application.Dtos;
using Au5.Application.Features.UserManagement.InviteUsers;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement;

public class InviteUsersCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IEmailProvider> _emailProviderMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _options;
	private readonly Mock<ICurrentUserService> _currentUserService;
	private readonly Guid _organizationId;

	private readonly InviteUsersCommandHandler _handler;

	public InviteUsersCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_emailProviderMock = new Mock<IEmailProvider>();
		_dataProviderMock = new Mock<IDataProvider>();
		_currentUserService = new Mock<ICurrentUserService>();
		_options = new Mock<IOptions<OrganizationOptions>>();
		_organizationId = Guid.NewGuid();

		var organizationOptions = new OrganizationOptions
		{
			SmtpHost = "smtp.test.com",
			SmtpPort = 587,
			SmtpUser = "test@test.com",
			SmtpPassword = "password",
			SmtpUseSSl = true,
			PanelUrl = "https://panel.test.com"
		};

		_options.Setup(x => x.Value).Returns(organizationOptions);
		_currentUserService.Setup(x => x.OrganizationId).Returns(_organizationId);
		_dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());
		_dataProviderMock.Setup(x => x.Now).Returns(DateTime.UtcNow);

		_handler = new InviteUsersCommandHandler(_dbContextMock.Object, _emailProviderMock.Object, _dataProviderMock.Object, _options.Object, _currentUserService.Object);
	}

	[Fact]
	public async Task Handle_ConfigMissing_ReturnsFailure()
	{
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var command = new InviteUsersCommand([
			new() { Email = "new@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
		_emailProviderMock.Verify(e => e.SendInviteAsync(It.IsAny<List<User>>(), It.IsAny<string>(), It.IsAny<SmtpOptions>()), Times.Never);
	}

	[Fact]
	public async Task Handle_UserAlreadyExists_ShouldBeFailed()
	{
		var config = new Organization { Id = _organizationId };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { new() { Email = "exists@example.com" } }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Forbidden("Forbidden")));

		var command = new InviteUsersCommand(
		[
			new() { Email = "exists@example.com", Role = RoleTypes.Admin }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("exists@example.com", result.Data.Failed);
		Assert.Empty(result.Data.Success);

		_emailProviderMock.Verify(e => e.SendInviteAsync(It.IsAny<List<User>>(), It.IsAny<string>(), It.IsAny<SmtpOptions>()), Times.Never);
	}

	[Fact]
	public async Task Handle_SaveChangesFails_ShouldReturnAllFailed()
	{
		var config = new Organization { Id = _organizationId };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Forbidden("Forbidden")));

		var command = new InviteUsersCommand(
		[
			new() { Email = "one@example.com", Role = RoleTypes.User },
			new() { Email = "two@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data.Success);
		Assert.Contains("one@example.com", result.Data.Failed);
		Assert.Contains("two@example.com", result.Data.Failed);

		_emailProviderMock.Verify(e => e.SendInviteAsync(It.IsAny<List<User>>(), It.IsAny<string>(), It.IsAny<SmtpOptions>()), Times.Never);
	}

	[Fact]
	public async Task Handle_MixedUsers_ShouldPartiallySucceed()
	{
		var config = new Organization { Id = _organizationId };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { new() { Email = "exists@example.com" } }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand(
		[
			new() { Email = "exists@example.com", Role = RoleTypes.Admin },
			new() { Email = "new@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("new@example.com", result.Data.Success);
		Assert.Contains("exists@example.com", result.Data.Failed);

		_emailProviderMock.Verify(
			e => e.SendInviteAsync(
			It.Is<List<User>>(u => u.Any(x => x.Email == "new@example.com")),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()), Times.Once);
	}

	[Fact]
	public async Task Handle_ValidInvites_ShouldAddUsersWithCorrectProperties()
	{
		var config = new Organization { Id = _organizationId, OrganizationName = "Test Org" };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var addedUsers = new List<User>();
		_dbContextMock.Setup(db => db.Set<User>().Add(It.IsAny<User>()))
			.Callback<User>(addedUsers.Add);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand(
		[
			new() { Email = "admin@example.com", Role = RoleTypes.Admin },
			new() { Email = "user@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(2, addedUsers.Count);

		var adminUser = addedUsers.First(u => u.Email == "admin@example.com");
		Assert.Equal(RoleTypes.Admin, adminUser.Role);
		Assert.Equal(_organizationId, adminUser.OrganizationId);
		Assert.False(adminUser.IsActive);
		Assert.Equal(UserStatus.SendVerificationLink, adminUser.Status);
		Assert.Equal("Not Entered", adminUser.FullName);
		Assert.Equal("Not Entered", adminUser.Password);
		Assert.Empty(adminUser.PictureUrl);

		var regularUser = addedUsers.First(u => u.Email == "user@example.com");
		Assert.Equal(RoleTypes.User, regularUser.Role);
	}

	[Fact]
	public async Task Handle_SuccessfulInvite_ShouldSendEmailWithCorrectSmtpOptions()
	{
		var config = new Organization { Id = _organizationId, OrganizationName = "Test Organization" };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand([new() { Email = "test@example.com", Role = RoleTypes.User }]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);

		_emailProviderMock.Verify(
			e => e.SendInviteAsync(
				It.Is<List<User>>(users => users.Count == 1 && users[0].Email == "test@example.com"),
				"Test Organization",
				It.Is<SmtpOptions>(opts =>
					opts.Host == "smtp.test.com" &&
					opts.Port == 587 &&
					opts.User == "test@test.com" &&
					opts.Password == "password" &&
					opts.UseSsl &&
					opts.BaseUrl == "https://panel.test.com")),
			Times.Once);
	}

	[Fact]
	public async Task Handle_MultipleNewUsers_ShouldInviteAll()
	{
		var config = new Organization { Id = _organizationId, OrganizationName = "Test Org" };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand(
		[
			new() { Email = "user1@example.com", Role = RoleTypes.User },
			new() { Email = "user2@example.com", Role = RoleTypes.Admin },
			new() { Email = "user3@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(3, result.Data.Success.Count);
		Assert.Contains("user1@example.com", result.Data.Success);
		Assert.Contains("user2@example.com", result.Data.Success);
		Assert.Contains("user3@example.com", result.Data.Success);
		Assert.Empty(result.Data.Failed);

		_emailProviderMock.Verify(
			e => e.SendInviteAsync(
				It.Is<List<User>>(users => users.Count == 3),
				It.IsAny<string>(),
				It.IsAny<SmtpOptions>()),
			Times.Once);
	}

	[Fact]
	public async Task Handle_AllUsersExist_ShouldReturnAllFailed()
	{
		var config = new Organization { Id = _organizationId, OrganizationName = "Test Org" };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>
			{
				new() { Email = "user1@example.com" },
				new() { Email = "user2@example.com" }
			}.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand(
		[
			new() { Email = "user1@example.com", Role = RoleTypes.User },
			new() { Email = "user2@example.com", Role = RoleTypes.Admin }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data.Success);
		Assert.Equal(2, result.Data.Failed.Count);
		Assert.Contains("user1@example.com", result.Data.Failed);
		Assert.Contains("user2@example.com", result.Data.Failed);

		_emailProviderMock.Verify(
			e => e.SendInviteAsync(
				It.Is<List<User>>(users => users.Count == 0),
				"Test Org",
				It.IsAny<SmtpOptions>()),
			Times.Once);
	}

	[Fact]
	public async Task Handle_SaveChangesSucceeds_ShouldNotAddToFailed()
	{
		var config = new Organization { Id = _organizationId };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand([new() { Email = "new@example.com", Role = RoleTypes.User }]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Single(result.Data.Success);
		Assert.Empty(result.Data.Failed);
		Assert.Contains("new@example.com", result.Data.Success);
	}

	[Fact]
	public async Task Handle_SaveChangesFails_ShouldClearSuccessAndAddToFailed()
	{
		var config = new Organization { Id = _organizationId };
		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { config }.BuildMockDbSet().Object);

		var existingUsers = new List<User> { new() { Email = "exists@example.com" } };
		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(existingUsers.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Forbidden("Save failed")));

		var command = new InviteUsersCommand(
		[
			new() { Email = "new1@example.com", Role = RoleTypes.User },
			new() { Email = "exists@example.com", Role = RoleTypes.Admin },
			new() { Email = "new2@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data.Success);
		Assert.Equal(3, result.Data.Failed.Count);
		Assert.Contains("new1@example.com", result.Data.Failed);
		Assert.Contains("exists@example.com", result.Data.Failed);
		Assert.Contains("new2@example.com", result.Data.Failed);

		_emailProviderMock.Verify(
			e => e.SendInviteAsync(It.IsAny<List<User>>(), It.IsAny<string>(), It.IsAny<SmtpOptions>()),
			Times.Never);
	}
}
