using Au5.Application.Features.Spaces.GetUserSpaces;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.GetUserSpaces;

public class GetUserSpacesQueryHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public GetUserSpacesQueryHandler Handler { get; private set; }

	public List<UserSpace> TestUserSpaces { get; private set; } = [];

	public List<Space> TestSpaces { get; private set; } = [];

	public GetUserSpacesQueryHandlerTestFixture WithUserId(Guid userId)
	{
		MockCurrentUserService.Setup(s => s.UserId).Returns(userId);
		return this;
	}

	public GetUserSpacesQueryHandlerTestFixture WithEmptyUserSpaces()
	{
		TestUserSpaces = [];
		var mockSet = TestUserSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(mockSet.Object);
		return this;
	}

	public GetUserSpacesQueryHandlerTestFixture WithUserSpaces(Guid userId, int spaceCount)
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		for (var i = 0; i < spaceCount; i++)
		{
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = $"Space {i + 1}",
				Description = $"Description for space {i + 1}",
				IsActive = true
			};

			var userSpace = new UserSpace
			{
				UserId = userId,
				SpaceId = space.Id,
				Space = space,
				JoinedAt = now.AddDays(-i),
				IsAdmin = i == 0
			};

			TestSpaces.Add(space);
			TestUserSpaces.Add(userSpace);
		}

		var mockSet = TestUserSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(mockSet.Object);

		return this;
	}

	public GetUserSpacesQueryHandlerTestFixture WithInactiveUserSpaces(Guid userId, int spaceCount)
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		for (var i = 0; i < spaceCount; i++)
		{
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = $"Inactive Space {i + 1}",
				Description = $"Description for inactive space {i + 1}",
				IsActive = false
			};

			var userSpace = new UserSpace
			{
				UserId = userId,
				SpaceId = space.Id,
				Space = space,
				JoinedAt = now.AddDays(-i),
				IsAdmin = false
			};

			TestSpaces.Add(space);
			TestUserSpaces.Add(userSpace);
		}

		var mockSet = TestUserSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(mockSet.Object);

		return this;
	}

	public GetUserSpacesQueryHandlerTestFixture WithSpecificUserSpace(Guid userId, Guid spaceId, string spaceName, string spaceDescription)
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		var space = new Space
		{
			Id = spaceId,
			Name = spaceName,
			Description = spaceDescription,
			IsActive = true
		};

		var userSpace = new UserSpace
		{
			UserId = userId,
			SpaceId = spaceId,
			Space = space,
			JoinedAt = now,
			IsAdmin = true
		};

		TestSpaces.Add(space);
		TestUserSpaces.Add(userSpace);

		var mockSet = TestUserSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(mockSet.Object);

		return this;
	}

	public GetUserSpacesQueryHandlerTestFixture BuildHandler()
	{
		Handler = new GetUserSpacesQueryHandler(MockDbContext.Object, MockCurrentUserService.Object);
		return this;
	}

	public UserSpacesQuery CreateQuery()
	{
		return new UserSpacesQuery();
	}
}
