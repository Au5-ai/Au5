using Au5.Application.Features.Spaces.RemoveMemberFromSpace;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.RemoveMemberFromSpace;

public class RemoveMemberFromSpaceCommandHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public Space TestSpace { get; private set; }

	public User CurrentUser { get; private set; }

	public List<UserSpace> SpaceMembers { get; private set; } = [];

	public RemoveMemberFromSpaceCommandHandler BuildHandler()
		=> new(MockDbContext.Object, MockCurrentUserService.Object);

	public RemoveMemberFromSpaceCommand CreateValidCommand()
	{
		var memberToRemove = SpaceMembers.First(us => !us.IsAdmin);
		return new RemoveMemberFromSpaceCommand(TestSpace.Id, memberToRemove.UserId);
	}

	public RemoveMemberFromSpaceCommandHandlerTestFixture WithActiveSpaceWithMembers(bool currentUserIsAdmin = true)
	{
		// Create users
		CurrentUser = new User
		{
			Id = Guid.NewGuid(),
			IsActive = true,
			Role = RoleTypes.User
		};

		var memberUser = new User
		{
			Id = Guid.NewGuid(),
			IsActive = true,
			Role = RoleTypes.User
		};

		// Create space
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Test Space",
			IsActive = true
		};

		// Add members
		SpaceMembers = new List<UserSpace>
		{
			new()
			{
				SpaceId = TestSpace.Id,
				UserId = CurrentUser.Id,
				User = CurrentUser,
				IsAdmin = currentUserIsAdmin,
				JoinedAt = DateTime.UtcNow
			},
			new()
			{
				SpaceId = TestSpace.Id,
				UserId = memberUser.Id,
				User = memberUser,
				IsAdmin = false,
				JoinedAt = DateTime.UtcNow
			}
		};

		TestSpace.UserSpaces = SpaceMembers;

		var spaces = new List<Space> { TestSpace }.BuildMockDbSet();
		var userSpaces = SpaceMembers.BuildMockDbSet();

		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaces.Object);
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(userSpaces.Object);

		return this;
	}

	public RemoveMemberFromSpaceCommandHandlerTestFixture WithCurrentUser(RoleTypes roleType)
	{
		MockCurrentUserService.Setup(c => c.UserId).Returns(CurrentUser.Id);
		MockCurrentUserService.Setup(c => c.Role).Returns(roleType);
		return this;
	}

	public RemoveMemberFromSpaceCommandHandlerTestFixture WithFailedSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ThrowsAsync(new Exception("Database save failed"));
		return this;
	}

	public RemoveMemberFromSpaceCommandHandlerTestFixture WithSuccessfulSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		return this;
	}
}
