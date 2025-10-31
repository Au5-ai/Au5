using Au5.Application.Common.Abstractions;
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
	private readonly InviteUsersCommandHandler _handler;

	public InviteUsersCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_emailProviderMock = new Mock<IEmailProvider>();
		_dataProviderMock = new Mock<IDataProvider>();
		_handler = new InviteUsersCommandHandler(_dbContextMock.Object, _emailProviderMock.Object, _dataProviderMock.Object);
	}

	[Fact]
	public async Task Handle_ConfigMissing_ReturnsFailure()
	{
		_dbContextMock.Setup(db => db.Set<SystemConfig>())
			.Returns(new List<SystemConfig>().BuildMockDbSet().Object);

		var command = new InviteUsersCommand(new List<InviteUsersRequest>
		{
			new() { Email = "new@example.com", Role = RoleTypes.User }
		});

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
		_emailProviderMock.Verify(e => e.SendInviteAsync(It.IsAny<List<User>>(), It.IsAny<string>(), It.IsAny<SmtpOptions>()), Times.Never);
	}

	[Fact]
	public async Task Handle_NewUserAdded_ShouldSucceedAndSendEmail()
	{
		var config = new SystemConfig
		{
			SmtpHost = "smtp.example.com",
			SmtpUser = "user",
			SmtpPassword = "pass",
			SmtpPort = 25,
			PanelUrl = "http://panel"
		};

		_dbContextMock.Setup(db => db.Set<SystemConfig>())
			.Returns(new List<SystemConfig> { config }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new InviteUsersCommand(
		[
			new() { Email = "new@example.com", Role = RoleTypes.User }
		]);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("new@example.com", result.Data.Success);
		Assert.Empty(result.Data.Failed);

		_emailProviderMock.Verify(
			e => e.SendInviteAsync(
			It.Is<List<User>>(u => u.Any(x => x.Email == "new@example.com")),
			It.IsAny<string>(),
			It.Is<SmtpOptions>(o => o.Host == config.SmtpHost)), Times.Once);
	}

	[Fact]
	public async Task Handle_UserAlreadyExists_ShouldBeFailed()
	{
		var config = new SystemConfig();
		_dbContextMock.Setup(db => db.Set<SystemConfig>())
			.Returns(new List<SystemConfig> { config }.BuildMockDbSet().Object);

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
		var config = new SystemConfig();
		_dbContextMock.Setup(db => db.Set<SystemConfig>())
			.Returns(new List<SystemConfig> { config }.BuildMockDbSet().Object);

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
		var config = new SystemConfig();
		_dbContextMock.Setup(db => db.Set<SystemConfig>())
			.Returns(new List<SystemConfig> { config }.BuildMockDbSet().Object);

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
}
