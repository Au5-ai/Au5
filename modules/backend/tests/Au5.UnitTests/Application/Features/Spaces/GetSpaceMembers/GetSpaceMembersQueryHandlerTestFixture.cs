using Au5.Application.Features.Spaces.GetSpaceMembers;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.GetSpaceMembers;

public class GetSpaceMembersQueryHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public GetSpaceMembersQueryHandler Handler { get; private set; }

	public Space TestSpace { get; private set; }

	public List<User> TestUsers { get; private set; } = [];

	public List<UserSpace> TestUserSpaces { get; private set; } = [];

	public GetSpaceMembersQueryHandlerTestFixture WithActiveSpace(Guid? spaceId = null)
	{
		TestSpace = new Space
		{
			Id = spaceId ?? Guid.NewGuid(),
			Name = "Test Space",
			Description = "Test Space Description",
			IsActive = true,
			UserSpaces = new List<UserSpace>()
		};

		MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space> { TestSpace }.BuildMockDbSet().Object);

		return this;
	}

	public GetSpaceMembersQueryHandlerTestFixture WithInactiveSpace()
	{
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Inactive Space",
			Description = "Inactive Space Description",
			IsActive = false,
			UserSpaces = new List<UserSpace>()
		};

		MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space> { TestSpace }.BuildMockDbSet().Object);

		return this;
	}

	public GetSpaceMembersQueryHandlerTestFixture WithUsers(int count = 2, bool includeInactiveUser = false)
	{
		if (TestSpace is null)
		{
			WithActiveSpace();
		}

		TestUsers = new List<User>();
		TestUserSpaces = new List<UserSpace>();

		var joinedAt = DateTime.UtcNow;

		for (int i = 0; i < count; i++)
		{
			bool isInactiveUser = includeInactiveUser && i == count - 1;

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

		MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space> { TestSpace }.BuildMockDbSet().Object);

		MockDbContext.Setup(db => db.Set<UserSpace>())
			.Returns(TestUserSpaces.BuildMockDbSet().Object);

		MockDbContext.Setup(db => db.Set<User>())
			.Returns(TestUsers.BuildMockDbSet().Object);

		return this;
	}

	public GetSpaceMembersQueryHandlerTestFixture WithCurrentUser(Guid? userId = null)
	{
		MockCurrentUserService.Setup(s => s.UserId)
			.Returns(userId ?? TestUsers.FirstOrDefault()?.Id ?? Guid.NewGuid());

		return this;
	}

	public GetSpaceMembersQueryHandler BuildHandler()
	{
		Handler = new GetSpaceMembersQueryHandler(MockDbContext.Object, MockCurrentUserService.Object);
		return Handler;
	}
}
