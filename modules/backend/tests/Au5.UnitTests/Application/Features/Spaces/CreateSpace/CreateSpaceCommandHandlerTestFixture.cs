using Au5.Application.Features.Spaces.CreateSpace;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandHandlerTestFixture
{
	private Guid _organizationId = Guid.NewGuid();

	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public CreateSpaceCommandHandler Handler { get; private set; }

	public Space TestParentSpace { get; private set; }

	public List<User> TestUsers { get; private set; } = [];

	public Space CreatedSpace { get; private set; }

	public List<UserSpace> CreatedUserSpaces { get; private set; } = [];

	public CreateSpaceCommandHandlerTestFixture WithValidParentSpace()
	{
		TestParentSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Parent Space",
			Description = "Parent Description",
			IsActive = true
		};

		var parentDbSet = new List<Space> { TestParentSpace }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(parentDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithInactiveParentSpace()
	{
		TestParentSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Inactive Parent Space",
			Description = "Inactive Parent Description",
			IsActive = false
		};

		var parentDbSet = new List<Space> { TestParentSpace }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(parentDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithNoParentSpace()
	{
		var parentDbSet = new List<Space>().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(parentDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithValidUsers(int userCount = 2)
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		TestUsers = [];
		for (var i = 0; i < userCount; i++)
		{
			TestUsers.Add(new User
			{
				Id = Guid.NewGuid(),
				FullName = $"Test User {i + 1}",
				Email = $"user{i + 1}@example.com",
				PictureUrl = $"https://example.com/user{i + 1}.jpg",
				IsActive = true,
				CreatedAt = now,
				Role = RoleTypes.User,
				Status = UserStatus.CompleteSignUp
			});
		}

		var userDbSet = TestUsers.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(userDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithInactiveUser()
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		var inactiveUser = new User
		{
			Id = Guid.NewGuid(),
			FullName = "Inactive User",
			Email = "inactive@example.com",
			IsActive = false,
			CreatedAt = now,
			Role = RoleTypes.User,
			Status = UserStatus.CompleteSignUp
		};

		TestUsers.Add(inactiveUser);

		var userDbSet = TestUsers.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(userDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithNoUsers()
	{
		var userDbSet = new List<User>().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(userDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithSuccessfulSave()
	{
		var spaces = new List<Space>();
		var userSpaces = new List<UserSpace>();

		MockDbContext.Setup(db => db.Set<Space>().Add(It.IsAny<Space>()))
			.Callback<Space>(s => spaces.Add(s));

		MockDbContext.Setup(db => db.Set<UserSpace>().AddRange(It.IsAny<IEnumerable<UserSpace>>()))
			.Callback<IEnumerable<UserSpace>>(us => userSpaces.AddRange(us));

		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success())
			.Callback(() =>
			{
				if (spaces.Any())
				{
					var spaceDbSet = spaces.BuildMockDbSet();
					MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);
				}
			});

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithFailedSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure("Database save failed")));

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithCreatedSpaceResponse(Space space, List<UserSpace> userSpaces)
	{
		CreatedSpace = space;
		CreatedUserSpaces = userSpaces;

		// Mock the response query with includes - this will be called after SaveChanges
		var responseDbSet = new List<Space> { space }.BuildMockDbSet();

		// Setup the mock to return the space for the final query
		MockDbContext.SetupSequence(db => db.Set<Space>())
			.Returns(responseDbSet.Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithFailedSpaceRetrieval()
	{
		MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space>().BuildMockDbSet().Object);

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithOrganizationId(Guid organizationId)
	{
		_organizationId = organizationId;
		return this;
	}

	public CreateSpaceCommandHandler BuildHandler()
	{
		var dataProviderMock = new Mock<IDataProvider>();
		dataProviderMock.Setup(d => d.NewGuid()).Returns(Guid.NewGuid());
		dataProviderMock.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
		MockCurrentUserService.Setup(u => u.OrganizationId).Returns(_organizationId);
		Handler = new CreateSpaceCommandHandler(MockDbContext.Object, dataProviderMock.Object, MockCurrentUserService.Object);
		return Handler;
	}

	public CreateSpaceCommand CreateValidCommand(bool withUsers = true)
	{
		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users = withUsers && TestUsers.Any()
				? [.. TestUsers.Select((user, index) => new UserInSpace
				{
					UserId = user.Id,
					IsAdmin = index == 0 // First user is admin
				})]
				: []
		};

		return command;
	}
}
