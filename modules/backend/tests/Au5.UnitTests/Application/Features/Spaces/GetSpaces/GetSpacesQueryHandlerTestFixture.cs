using Au5.Application.Features.Spaces.GetSpaces;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.GetSpaces;

public class GetSpacesQueryHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public GetSpacesQueryHandler Handler { get; private set; }

	public List<Space> TestSpaces { get; private set; } = [];

	public List<User> TestUsers { get; private set; } = [];

	public List<UserSpace> TestUserSpaces { get; private set; } = [];

	public static SpacesQuery CreateQuery()
	{
		return new SpacesQuery();
	}

	public GetSpacesQueryHandlerTestFixture WithActiveSpaces(int spaceCount = 3)
	{
		TestSpaces = [];
		for (var i = 0; i < spaceCount; i++)
		{
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = $"Test Space {i + 1}",
				Description = $"Description for space {i + 1}",
				IsActive = true
			};
			TestSpaces.Add(space);
		}

		var mockSet = TestSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(mockSet.Object);

		return this;
	}

	public GetSpacesQueryHandlerTestFixture WithInactiveSpaces(int spaceCount = 2)
	{
		var inactiveSpaces = new List<Space>();
		for (var i = 0; i < spaceCount; i++)
		{
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = $"Inactive Space {i + 1}",
				Description = $"Description for inactive space {i + 1}",
				IsActive = false
			};
			inactiveSpaces.Add(space);
		}

		TestSpaces.AddRange(inactiveSpaces);

		var allSpaces = TestSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(allSpaces.Object);

		return this;
	}

	public GetSpacesQueryHandlerTestFixture WithSpacesWithParents()
	{
		var parentSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Parent Space",
			Description = "Parent description",
			IsActive = true
		};

		var childSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Child Space",
			Description = "Child description",
			IsActive = true
		};

		TestSpaces.AddRange(new[] { parentSpace, childSpace });

		var mockSet = TestSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(mockSet.Object);

		return this;
	}

	public GetSpacesQueryHandlerTestFixture WithSpacesWithUsers(int userCount = 2)
	{
		TestUsers = [];
		TestUserSpaces = [];

		for (var i = 0; i < userCount; i++)
		{
			var user = new User
			{
				Id = Guid.NewGuid(),
				FullName = $"User {i + 1}",
				Email = $"user{i + 1}@test.com",
				PictureUrl = $"picture{i + 1}.jpg",
				IsActive = true
			};
			TestUsers.Add(user);
		}

		var now = DateTime.Parse("2025-01-15T10:00:00");

		// Add users to the first space
		if (TestSpaces.Count != 0)
		{
			var firstSpace = TestSpaces.First();
			foreach (var user in TestUsers)
			{
				var userSpace = new UserSpace
				{
					UserId = user.Id,
					User = user,
					SpaceId = firstSpace.Id,
					Space = firstSpace,
					JoinedAt = now.AddDays(-1),
					IsAdmin = user.Id == TestUsers.First().Id
				};
				TestUserSpaces.Add(userSpace);
			}

			firstSpace.UserSpaces = TestUserSpaces;
		}

		return this;
	}

	public GetSpacesQueryHandlerTestFixture WithEmptySpaces()
	{
		TestSpaces = [];
		var mockSet = TestSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(mockSet.Object);

		return this;
	}

	public GetSpacesQueryHandlerTestFixture BuildHandler()
	{
		Handler = new GetSpacesQueryHandler(MockDbContext.Object);
		return this;
	}
}
