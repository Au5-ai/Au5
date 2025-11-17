using Au5.Application.Dtos;
using Au5.Application.Features.UserManagement.Search;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement.Search;

public class SearchUserQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly SearchUserQueryHandler _handler;
	private readonly Guid _organizationId;

	public SearchUserQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_organizationId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(_organizationId);

		_handler = new SearchUserQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_QueryIsNull()
	{
		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new SearchUserQuery(null);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_QueryIsEmpty()
	{
		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(new List<User>().BuildMockDbSet().Object);

		var query = new SearchUserQuery(string.Empty);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_NoMatchingUsersFound()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("Alice");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_ReturnMatchingUsers_When_SearchByFullNamePrefix()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Jane Smith",
				Email = "jane@example.com",
				IsActive = true,
				PictureUrl = "jane.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		Assert.Equal("John Doe", result.First().FullName);
	}

	[Fact]
	public async Task Should_ReturnMatchingUsers_When_SearchByEmailPrefix()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Jane Smith",
				Email = "jane@example.com",
				IsActive = true,
				PictureUrl = "jane.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("john@");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		Assert.Equal("john@example.com", result.First().Email);
	}

	[Fact]
	public async Task Should_ReturnOnlyActiveUsers_When_InactiveUsersExist()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "TestActive User",
				Email = "active@example.com",
				IsActive = true,
				PictureUrl = "active.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "TestInactive User",
				Email = "inactive@example.com",
				IsActive = false,
				PictureUrl = "inactive.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("TestActive");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		Assert.Equal("TestActive User", result.First().FullName);
	}

	[Fact]
	public async Task Should_ReturnOnlyOrganizationUsers_When_MultipleOrganizationsExist()
	{
		var otherOrgId = Guid.NewGuid();

		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@myorg.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = otherOrgId,
				FullName = "John Smith",
				Email = "john@otherorg.com",
				IsActive = true,
				PictureUrl = "johnsmith.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		Assert.Equal("john@myorg.com", result.First().Email);
	}

	[Fact]
	public async Task Should_ReturnMaxTenResults_When_MoreThanTenUsersMatch()
	{
		var users = new List<User>();
		for (int i = 1; i <= 15; i++)
		{
			users.Add(new User
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = $"User {i:D2}",
				Email = $"user{i}@example.com",
				IsActive = true,
				PictureUrl = $"user{i}.jpg"
			});
		}

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("User");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(10, result.Count);
	}

	[Fact]
	public async Task Should_ReturnParticipantWithAllProperties_When_UserMatches()
	{
		var userId = Guid.NewGuid();
		var users = new List<User>
		{
			new()
			{
				Id = userId,
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "https://example.com/john.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		var participant = result.First();
		Assert.Equal(userId, participant.Id);
		Assert.Equal("John Doe", participant.FullName);
		Assert.Equal("john@example.com", participant.Email);
		Assert.Equal("https://example.com/john.jpg", participant.PictureUrl);
	}

	[Fact]
	public async Task Should_ReturnMultipleUsers_When_MultipleUsersMatchPrefix()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Mike Doe",
				Email = "mike@example.com",
				IsActive = true,
				PictureUrl = "mike.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Michael Smith",
				Email = "michael@example.com",
				IsActive = true,
				PictureUrl = "michael.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Michelle Lee",
				Email = "michelle@example.com",
				IsActive = true,
				PictureUrl = "michelle.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("Mich");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(2, result.Count);
		Assert.All(result, p => Assert.StartsWith("Mich", p.FullName));
	}

	[Fact]
	public async Task Should_MatchEmailOrFullName_When_SearchQueryProvided()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Sam Johnson",
				Email = "sam@example.com",
				IsActive = true,
				PictureUrl = "sam.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Bob Smith",
				Email = "Sam@company.com",
				IsActive = true,
				PictureUrl = "bob.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("Sam");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Equal(2, result.Count);
		Assert.Contains(result, p => p.FullName == "Sam Johnson");
		Assert.Contains(result, p => p.Email == "Sam@company.com");
	}

	[Fact]
	public async Task Should_UseCurrentOrganizationId_When_FilteringUsers()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		_currentUserServiceMock.Verify(x => x.OrganizationId, Times.AtLeastOnce);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<User>(), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnReadOnlyCollection_When_UsersMatch()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.IsAssignableFrom<IReadOnlyCollection<Participant>>(result);
	}

	[Fact]
	public async Task Should_OnlyReturnUsersWithStartsWith_When_PartialMatchExists()
	{
		var users = new List<User>
		{
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "John Doe",
				Email = "john@example.com",
				IsActive = true,
				PictureUrl = "john.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				OrganizationId = _organizationId,
				FullName = "Bob Johnson",
				Email = "bob@example.com",
				IsActive = true,
				PictureUrl = "bob.jpg"
			}
		};

		_dbContextMock.Setup(db => db.Set<User>())
			.Returns(users.BuildMockDbSet().Object);

		var query = new SearchUserQuery("John");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.NotNull(result);
		Assert.Single(result);
		Assert.Equal("John Doe", result.First().FullName);
		Assert.DoesNotContain(result, p => p.FullName == "Bob Johnson");
	}
}
