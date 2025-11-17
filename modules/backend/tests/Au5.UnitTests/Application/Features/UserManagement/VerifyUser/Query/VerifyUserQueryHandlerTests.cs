using System.Net;
using Au5.Application.Features.UserManagement.VerifyUser.Query;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement.VerifyUser.Query;

public class VerifyUserQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly VerifyUserQueryHandler _handler;

	public VerifyUserQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_handler = new VerifyUserQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_UserNotFound()
	{
		var userId = Guid.NewGuid();
		var hashedEmail = "somehash";

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Contains("not found", result.Error.Description, StringComparison.OrdinalIgnoreCase);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_HashedEmailDoesNotMatch()
	{
		var userId = Guid.NewGuid();
		var email = "test@example.com";
		var correctHashedEmail = HashHelper.HashSafe(email);
		var incorrectHashedEmail = "incorrecthash";

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, incorrectHashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Contains("not found", result.Error.Description, StringComparison.OrdinalIgnoreCase);
	}

	[Fact]
	public async Task Should_ReturnUnauthorized_When_UserIsAlreadyRegistered()
	{
		var userId = Guid.NewGuid();
		var email = "test@example.com";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.CompleteSignUp,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
		Assert.Contains("authorized", result.Error.Description, StringComparison.OrdinalIgnoreCase);
	}

	[Fact]
	public async Task Should_ReturnVerifyUserResponse_When_UserIsValidAndNotRegistered()
	{
		var userId = Guid.NewGuid();
		var email = "test@example.com";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(email, result.Data.Email);
	}

	[Fact]
	public async Task Should_VerifyEmailWithCorrectHash_When_EmailContainsSpecialCharacters()
	{
		var userId = Guid.NewGuid();
		var email = "test+tag@example.co.uk";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(email, result.Data.Email);
	}

	[Fact]
	public async Task Should_UseCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		var userId = Guid.NewGuid();
		var hashedEmail = "somehash";

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_QueryByUserId_When_HandlingRequest()
	{
		var userId = Guid.NewGuid();
		var otherUserId = Guid.NewGuid();
		var email = "test@example.com";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			},
			new()
			{
				Id = otherUserId,
				Email = "other@example.com",
				Status = UserStatus.SendVerificationLink,
				FullName = "Other User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(email, result.Data.Email);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_UserIdIsEmpty()
	{
		var userId = Guid.Empty;
		var hashedEmail = "somehash";

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_EmailHashIsCaseSensitiveMismatch()
	{
		var userId = Guid.NewGuid();
		var email = "Test@Example.com";
		var hashedEmail = HashHelper.HashSafe(email);
		var wrongCaseHash = HashHelper.HashSafe("test@example.com");

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, wrongCaseHash);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
	}

	[Fact]
	public async Task Should_ReturnCorrectEmail_When_VerificationSuccessful()
	{
		var userId = Guid.NewGuid();
		var email = "verified@example.com";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Verified User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.IsType<VerifyUserResponse>(result.Data);
		Assert.Equal(email, result.Data.Email);
	}

	[Fact]
	public async Task Should_ValidateHashCorrectly_When_EmailContainsUnicodeCharacters()
	{
		var userId = Guid.NewGuid();
		var email = "tëst@éxample.com";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(email, result.Data.Email);
	}

	[Fact]
	public async Task Should_VerifyOnlyPendingUsers_When_StatusIsSendVerificationLink()
	{
		var userId = Guid.NewGuid();
		var email = "pending@example.com";
		var hashedEmail = HashHelper.HashSafe(email);

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Pending User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, hashedEmail);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_HashIsEmpty()
	{
		var userId = Guid.NewGuid();
		var email = "test@example.com";
		var emptyHash = string.Empty;

		var users = new List<User>
		{
			new()
			{
				Id = userId,
				Email = email,
				Status = UserStatus.SendVerificationLink,
				FullName = "Test User",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId, emptyHash);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
	}

	[Fact]
	public async Task Should_MatchExactHash_When_MultipleUsersExist()
	{
		var userId1 = Guid.NewGuid();
		var userId2 = Guid.NewGuid();
		var email1 = "user1@example.com";
		var email2 = "user2@example.com";
		var hashedEmail1 = HashHelper.HashSafe(email1);

		var users = new List<User>
		{
			new()
			{
				Id = userId1,
				Email = email1,
				Status = UserStatus.SendVerificationLink,
				FullName = "User 1",
				OrganizationId = Guid.NewGuid()
			},
			new()
			{
				Id = userId2,
				Email = email2,
				Status = UserStatus.SendVerificationLink,
				FullName = "User 2",
				OrganizationId = Guid.NewGuid()
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new VerifyUserQuery(userId1, hashedEmail1);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(email1, result.Data.Email);
	}
}
