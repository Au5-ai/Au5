using System.Net;
using Au5.Application.Features.UserManagement.VerifyUser.Command;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement.VerifyUser.Command;

public class VerifyUserCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly VerifyUserCommandHandler _handler;
	private readonly DateTime _fixedDate;

	public VerifyUserCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_dataProviderMock = new Mock<IDataProvider>();
		_fixedDate = new DateTime(2025, 11, 16, 10, 0, 0);

		_dataProviderMock.Setup(x => x.Now).Returns(_fixedDate);

		_handler = new VerifyUserCommandHandler(_dbContextMock.Object, _dataProviderMock.Object);
	}

	[Fact]
	public async Task Should_ReturnError_When_UserNotFound()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			"hashedemail",
			"Test User",
			"password123",
			"password123");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Contains("User not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_UserAlreadyRegistered()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.CompleteSignUp
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe("test@example.com"),
			"Updated Name",
			"password123",
			"password123");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
		Assert.Contains("not authorized", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_HashedEmailDoesNotMatch()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = "correct@example.com",
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe("wrong@example.com"),
			"Test User",
			"password123",
			"password123");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Contains("User not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnError_When_SaveChangesFails()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Old Name",
			Status = UserStatus.SendVerificationLink
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure(description: "Database error")));

		var command = new VerifyUserCommand(
				userId,
				organizationId,
				HashHelper.HashSafe(email),
				"New Name",
				"password123",
				"password123");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Contains("Failed to Update User", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_UserVerifiedSuccessfully()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Old Name",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"New Name",
			"password123",
			"password123");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.True(result.Data.IsDone);
	}

	[Fact]
	public async Task Should_UpdateUserFullName_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Old Name",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"John Doe",
			"password123",
			"password123");

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal("John Doe", user.FullName);
	}

	[Fact]
	public async Task Should_HashPassword_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";
		var password = "mySecurePassword123";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			password,
			password);

		await _handler.Handle(command, CancellationToken.None);

		var expectedHash = HashHelper.HashPassword(password, userId);
		Assert.Equal(expectedHash, user.Password);
	}

	[Fact]
	public async Task Should_SetStatusToCompleteSignUp_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			"password123",
			"password123");

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal(UserStatus.CompleteSignUp, user.Status);
	}

	[Fact]
	public async Task Should_SetIsActiveToTrue_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			"password123",
			"password123");

		await _handler.Handle(command, CancellationToken.None);

		Assert.True(user.IsActive);
	}

	[Fact]
	public async Task Should_SetLastPasswordChangeAt_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			"password123",
			"password123");

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal(_fixedDate, user.LastPasswordChangeAt);
	}

	[Fact]
	public async Task Should_CallSaveChangesAsync_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			"password123",
			"password123");

		await _handler.Handle(command, CancellationToken.None);

		_dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			"hashedemail",
			"Test User",
			"password123",
			"password123");

		await _handler.Handle(command, cancellationToken);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_SavingChanges()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			"password123",
			"password123");

		await _handler.Handle(command, cancellationToken);

		_dbContextMock.Verify(db => db.SaveChangesAsync(cancellationToken), Times.Once);
	}

	[Fact]
	public async Task Should_UpdateAllUserProperties_When_Verifying()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";
		var newFullName = "Jane Smith";
		var password = "newPassword456";

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Old Name",
			Status = UserStatus.SendVerificationLink,
			IsActive = false,
			Password = string.Empty,
			LastPasswordChangeAt = null
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			newFullName,
			password,
			password);

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal(newFullName, user.FullName);
		Assert.Equal(HashHelper.HashPassword(password, userId), user.Password);
		Assert.Equal(UserStatus.CompleteSignUp, user.Status);
		Assert.True(user.IsActive);
		Assert.Equal(_fixedDate, user.LastPasswordChangeAt);
	}

	[Fact]
	public async Task Should_UseDataProviderNow_When_SettingLastPasswordChangeAt()
	{
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var email = "test@example.com";
		var specificDate = new DateTime(2025, 12, 25, 15, 30, 0);

		_dataProviderMock.Setup(x => x.Now).Returns(specificDate);

		var handler = new VerifyUserCommandHandler(_dbContextMock.Object, _dataProviderMock.Object);

		var user = new User
		{
			Id = userId,
			OrganizationId = organizationId,
			Email = email,
			FullName = "Test User",
			Status = UserStatus.SendVerificationLink,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new VerifyUserCommand(
			userId,
			organizationId,
			HashHelper.HashSafe(email),
			"Test User",
			"password123",
			"password123");

		await handler.Handle(command, CancellationToken.None);

		Assert.Equal(specificDate, user.LastPasswordChangeAt);
		_dataProviderMock.Verify(x => x.Now, Times.Once);
	}
}
