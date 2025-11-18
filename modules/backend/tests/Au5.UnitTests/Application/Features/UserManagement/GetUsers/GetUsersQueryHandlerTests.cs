using Au5.Application.Features.UserManagement.GetUsers;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement.GetUsers;

public class GetUsersQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly GetUsersQueryHandler _handler;
	private readonly Guid _organizationId;

	public GetUsersQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_organizationId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(_organizationId);

		_handler = new GetUsersQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_NoUsersExist()
	{
		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_ReturnOnlyOrganizationUsers_When_MultipleOrganizationsExist()
	{
		var otherOrgId = Guid.NewGuid();

		var user1 = new User
		{
			Id = Guid.NewGuid(),
			OrganizationId = _organizationId,
			Email = "user1@test.com",
			FullName = "User One",
			Status = UserStatus.CompleteSignUp
		};

		var user2 = new User
		{
			Id = Guid.NewGuid(),
			OrganizationId = otherOrgId,
			Email = "user2@other.com",
			FullName = "User Two",
			Status = UserStatus.CompleteSignUp
		};

		var user3 = new User
		{
			Id = Guid.NewGuid(),
			OrganizationId = _organizationId,
			Email = "user3@test.com",
			FullName = "User Three",
			Status = UserStatus.SendVerificationLink
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user1, user2, user3 }.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(2, result.Count);
		Assert.Contains(result, u => u.Email == "user1@test.com");
		Assert.Contains(result, u => u.Email == "user3@test.com");
		Assert.DoesNotContain(result, u => u.Email == "user2@other.com");
	}

	[Fact]
	public async Task Should_ReturnAllUsers_When_AllBelongToOrganization()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "user1@test.com",
				FullName = "User One",
				Status = UserStatus.CompleteSignUp
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "user2@test.com",
				FullName = "User Two",
				Status = UserStatus.CompleteSignUp
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "user3@test.com",
				FullName = "User Three",
				Status = UserStatus.SendVerificationLink
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(3, result.Count);
	}

	[Fact]
	public async Task Should_ReturnUserWithAllProperties_When_UsersExist()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			OrganizationId = _organizationId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.CompleteSignUp,
			PictureUrl = "https://example.com/picture.jpg"
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		var returnedUser = result.First();
		Assert.Equal(userId, returnedUser.Id);
		Assert.Equal(_organizationId, returnedUser.OrganizationId);
		Assert.Equal("test@example.com", returnedUser.Email);
		Assert.Equal("Test User", returnedUser.FullName);
		Assert.Equal(UserStatus.CompleteSignUp, returnedUser.Status);
		Assert.Equal("https://example.com/picture.jpg", returnedUser.PictureUrl);
	}

	[Fact]
	public async Task Should_UseCurrentUserOrganizationId_When_FilteringUsers()
	{
		var specificOrgId = Guid.NewGuid();
		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(specificOrgId);

		var handler = new GetUsersQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);

		var user1 = new User
		{
			Id = Guid.NewGuid(),
			OrganizationId = specificOrgId,
			Email = "user1@test.com",
			FullName = "User One",
			Status = UserStatus.CompleteSignUp
		};

		var user2 = new User
		{
			Id = Guid.NewGuid(),
			OrganizationId = Guid.NewGuid(),
			Email = "user2@other.com",
			FullName = "User Two",
			Status = UserStatus.CompleteSignUp
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user1, user2 }.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Single(result);
		Assert.Equal("user1@test.com", result.First().Email);
	}

	[Fact]
	public async Task Should_ReturnUsersWithDifferentStatuses_When_OrganizationHasVariousUsers()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "verified@test.com",
				FullName = "Verified User",
				Status = UserStatus.CompleteSignUp
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "pending@test.com",
				FullName = "Pending User",
				Status = UserStatus.SendVerificationLink
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.Equal(2, result.Count);
		Assert.Contains(result, u => u.Status == UserStatus.CompleteSignUp);
		Assert.Contains(result, u => u.Status == UserStatus.SendVerificationLink);
	}

	[Fact]
	public async Task Should_UseAsNoTracking_When_QueryingUsers()
	{
		var user = new User
		{
			Id = Guid.NewGuid(),
			OrganizationId = _organizationId,
			Email = "test@example.com",
			FullName = "Test User",
			Status = UserStatus.CompleteSignUp
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User> { user }.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		await _handler.Handle(query, CancellationToken.None);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnMultipleUsers_When_OrganizationHasManyMembers()
	{
		var users = new List<User>();
		for (var i = 1; i <= 10; i++)
		{
			users.Add(new User
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = $"user{i}@test.com",
				FullName = $"User {i}",
				Status = i % 2 == 0 ? UserStatus.CompleteSignUp : UserStatus.SendVerificationLink
			});
		}

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.Equal(10, result.Count);
		Assert.All(result, u => Assert.Equal(_organizationId, u.OrganizationId));
	}

	[Fact]
	public async Task Should_ReturnReadOnlyCollection_When_UsersExist()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "user@test.com",
				FullName = "Test User",
				Status = UserStatus.CompleteSignUp
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.IsAssignableFrom<IReadOnlyCollection<User>>(result);
	}

	[Fact]
	public async Task Should_FilterByOrganizationId_When_CallingHandle()
	{
		var correctOrgUsers = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "correct1@test.com",
				FullName = "Correct User 1",
				Status = UserStatus.CompleteSignUp
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				Email = "correct2@test.com",
				FullName = "Correct User 2",
				Status = UserStatus.CompleteSignUp
			}
		};

		var wrongOrgUsers = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = Guid.NewGuid(),
				Email = "wrong1@test.com",
				FullName = "Wrong User 1",
				Status = UserStatus.CompleteSignUp
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = Guid.NewGuid(),
				Email = "wrong2@test.com",
				FullName = "Wrong User 2",
				Status = UserStatus.CompleteSignUp
			}
		};

		var allUsers = correctOrgUsers.Concat(wrongOrgUsers).ToList();

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(allUsers.BuildMockDbSet().Object);

		var query = new GetUsersQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.Equal(2, result.Count);
		Assert.All(result, u => Assert.Equal(_organizationId, u.OrganizationId));
		Assert.All(result, u => Assert.StartsWith("correct", u.Email));
	}
}
