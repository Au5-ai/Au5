using Au5.Application.Features.Spaces.SpaceMembers;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.SpaceMembers;

public class SpaceMembersQueryHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public SpaceMembersQueryHandler Handler { get; private set; }

	public Space TestSpace { get; private set; }

	public List<User> TestUsers { get; private set; } = [];

	public List<UserSpace> TestUserSpaces { get; private set; } = [];

	public SpaceMembersQueryHandlerTestFixture WithActiveSpace(Guid? spaceId = null)
	{
		TestSpace = new Space
		{
			Id = spaceId ?? Guid.NewGuid(),
			Name = "Test Space",
			Description = "Test Space Description",
			IsActive = true,
			UserSpaces = []
		};

		MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space> { TestSpace }.BuildMockDbSet().Object);

		return this;
	}

	public SpaceMembersQueryHandlerTestFixture WithInactiveSpace()
	{
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Inactive Space",
			Description = "Inactive Space Description",
			IsActive = false,
			UserSpaces = []
		};

		MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space> { TestSpace }.BuildMockDbSet().Object);

		return this;
	}

	public SpaceMembersQueryHandlerTestFixture WithUsers(int count = 2, bool includeInactiveUser = false)
	{
		if (TestSpace is null)
		{
			WithActiveSpace();
		}

		TestUsers = [];
		TestUserSpaces = [];

		var joinedAt = DateTime.UtcNow;

		for (var i = 0; i < count; i++)
		{
			var isInactiveUser = includeInactiveUser && i == count - 1;

			var user = new User
			{
				Id = Guid.NewGuid(),
				FullName = $"Test User {i + 1}",
				Email = $"user{i + 1}@example.com",
				IsActive = !isInactiveUser,
				PictureUrl = $"https://example.com/user{i + 1}.jpg",
				CreatedAt = DateTime.UtcNow,
				Role = RoleTypes.User,
				Status = UserStatus.CompleteSignUp
			};

			var userSpace = new UserSpace
			{
				SpaceId = TestSpace.Id,
				UserId = user.Id,
				IsAdmin = i == 0,
				JoinedAt = joinedAt,
				User = user
			};

			TestUsers.Add(user);
			TestUserSpaces.Add(userSpace);
		}

		TestSpace.UserSpaces = TestUserSpaces;

		var activeUserSpaces = TestUserSpaces
			.Where(us => us.User.IsActive)
			.ToList();

		var activeSpaceMock = new List<Space>
		{
			new()
			{
				Id = TestSpace.Id,
				Name = TestSpace.Name,
				Description = TestSpace.Description,
				IsActive = TestSpace.IsActive,
				UserSpaces = activeUserSpaces
			}
		}.BuildMockDbSet();

		MockDbContext.Setup(db => db.Set<Space>()).Returns(activeSpaceMock.Object);
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(TestUserSpaces.BuildMockDbSet().Object);
		MockDbContext.Setup(db => db.Set<User>()).Returns(TestUsers.BuildMockDbSet().Object);

		return this;
	}

	public SpaceMembersQueryHandlerTestFixture WithCurrentUser(Guid? userId = null)
	{
		MockCurrentUserService.Setup(s => s.UserId)
			.Returns(userId ?? TestUsers.FirstOrDefault()?.Id ?? Guid.NewGuid());

		return this;
	}

	public SpaceMembersQueryHandler BuildHandler()
	{
		Handler = new SpaceMembersQueryHandler(MockDbContext.Object, MockCurrentUserService.Object);
		return Handler;
	}
}
