using Au5.Application.Features.Spaces.CreateSpace;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

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
				CreatedAt = DateTime.UtcNow,
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
		var inactiveUser = new User
		{
			Id = Guid.NewGuid(),
			FullName = "Inactive User",
			Email = "inactive@example.com",
			IsActive = false,
			CreatedAt = DateTime.UtcNow,
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
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Au5.Shared.Result.Success());

		return this;
	}

	public CreateSpaceCommandHandlerTestFixture WithFailedSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Au5.Shared.Result.Failure(Au5.Shared.Error.Failure("Database save failed")));

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

	public CreateSpaceCommandHandler BuildHandler()
	{
		Handler = new CreateSpaceCommandHandler(MockDbContext.Object);
		return Handler;
	}

	public CreateSpaceCommand CreateValidCommand(bool withParent = false, bool withUsers = true)
	{
		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = withParent ? TestParentSpace?.Id : null,
			Users = withUsers && TestUsers.Any()
				? TestUsers.Select((user, index) => new UserInSpace
				{
					UserId = user.Id,
					IsAdmin = index == 0 // First user is admin
				}).ToList()
				: []
		};

		return command;
	}
}
