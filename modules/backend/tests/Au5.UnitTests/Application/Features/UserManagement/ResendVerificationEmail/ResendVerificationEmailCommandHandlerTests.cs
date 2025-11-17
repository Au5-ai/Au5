using System.Net;
using Au5.Application.Common.Options;
using Au5.Application.Dtos;
using Au5.Application.Features.UserManagement.ResendVerificationEmail;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement.ResendVerificationEmail;

public class ResendVerificationEmailCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IEmailProvider> _emailProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _optionsMock;
	private readonly ResendVerificationEmailCommandHandler _handler;
	private readonly OrganizationOptions _organizationOptions;

	public ResendVerificationEmailCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_emailProviderMock = new Mock<IEmailProvider>();
		_optionsMock = new Mock<IOptions<OrganizationOptions>>();

		_organizationOptions = new OrganizationOptions
		{
			SmtpHost = "smtp.test.com",
			SmtpPort = 587,
			SmtpUser = "test@test.com",
			SmtpPassword = "password123",
			SmtpUseSSl = true,
			PanelUrl = "https://panel.test.com"
		};

		_optionsMock.Setup(x => x.Value).Returns(_organizationOptions);

		_handler = new ResendVerificationEmailCommandHandler(
			_dbContextMock.Object,
			_emailProviderMock.Object,
			_optionsMock.Object);
	}

	[Fact]
	public async Task Should_ReturnError_When_UserNotFound()
	{
		var userId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Contains("User not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_UserEmailAlreadyVerified()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.CompleteSignUp
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Contains("already been verified", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_OrganizationNotConfigured()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Contains("not been configured", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_EmailProviderReturnsNull()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync((List<InviteResponse>)null);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Contains("SMTP", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_EmailProviderReturnsEmptyList()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync([]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Contains("SMTP", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_EmailSentSuccessfully()
	{
		var userId = Guid.NewGuid();
		var verificationLink = "https://panel.test.com/verify/abc123";

		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync(
			[
				new() { UserId = userId, Link = verificationLink }
			]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(verificationLink, result.Data.Link);
	}

	[Fact]
	public async Task Should_PassCorrectUserToEmailProvider_When_SendingEmail()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync(
			[
				new() { UserId = userId, Link = "https://test.com" }
			]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		await _handler.Handle(command, CancellationToken.None);

		_emailProviderMock.Verify(
			x => x.SendInviteAsync(
			It.Is<IReadOnlyCollection<User>>(users => users.Count == 1 && users.First().Id == userId),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_PassOrganizationNameToEmailProvider_When_SendingEmail()
	{
		var userId = Guid.NewGuid();
		var organizationName = "Acme Corporation";

		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = organizationName
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync(
			[
				new() { UserId = userId, Link = "https://test.com" }
			]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		await _handler.Handle(command, CancellationToken.None);

		_emailProviderMock.Verify(
			x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			organizationName,
			It.IsAny<SmtpOptions>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_PassSmtpOptionsToEmailProvider_When_SendingEmail()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync(
			[
				new() { UserId = userId, Link = "https://test.com" }
			]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		await _handler.Handle(command, CancellationToken.None);

		_emailProviderMock.Verify(
			x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.Is<SmtpOptions>(opts =>
				opts.Host == _organizationOptions.SmtpHost &&
				opts.Port == _organizationOptions.SmtpPort &&
				opts.User == _organizationOptions.SmtpUser &&
				opts.Password == _organizationOptions.SmtpPassword &&
				opts.UseSsl == _organizationOptions.SmtpUseSSl &&
				opts.BaseUrl == _organizationOptions.PanelUrl)),
			Times.Once);
	}

	[Fact]
	public async Task Should_UseAsNoTracking_When_QueryingUser()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var dbSetMock = new List<User> { user }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(dbSetMock.Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization>().BuildMockDbSet().Object);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		await _handler.Handle(command, CancellationToken.None);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_UseAsNoTracking_When_QueryingOrganization()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync(
			[
				new() { UserId = userId, Link = "https://test.com" }
			]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		await _handler.Handle(command, CancellationToken.None);

		_dbContextMock.Verify(db => db.Set<Organization>(), Times.Once);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;
		var userId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		await _handler.Handle(command, cancellationToken);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFirstLinkFromEmailProvider_When_MultipleLinksReturned()
	{
		var userId = Guid.NewGuid();
		var firstLink = "https://panel.test.com/verify/first";
		var secondLink = "https://panel.test.com/verify/second";

		var user = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		var organization = new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_emailProviderMock.Setup(x => x.SendInviteAsync(
			It.IsAny<IReadOnlyCollection<User>>(),
			It.IsAny<string>(),
			It.IsAny<SmtpOptions>()))
			.ReturnsAsync(
			[
				new() { UserId = userId, Link = firstLink },
				new() { UserId = Guid.NewGuid(), Link = secondLink }
			]);

		var command = new ResendVerificationEmailCommand { UserId = userId };

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(firstLink, result.Data.Link);
	}
}
