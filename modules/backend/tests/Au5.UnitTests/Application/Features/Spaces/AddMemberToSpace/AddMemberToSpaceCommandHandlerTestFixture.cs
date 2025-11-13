using Au5.Application.Features.Spaces.AddMemberToSpace;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.AddMemberToSpace;

public class AddMemberToSpaceCommandHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public Mock<IDataProvider> MockDataProvider { get; } = new();

	public AddMemberToSpaceCommandHandler Handler { get; private set; }

	public User CurrentUser { get; private set; } = default!;

	public Space TestSpace { get; private set; } = default!;

	public List<UserSpace> SpaceMembers { get; private set; } = [];

	public AddMemberToSpaceCommandHandlerTestFixture WithActiveSpaceWithMembers(bool currentUserIsAdmin = true)
	{
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Test Space",
			IsActive = true,
			UserSpaces = []
		};

		CurrentUser = new User
		{
			Id = Guid.NewGuid(),
			IsActive = true,
			Role = RoleTypes.User
		};

		var otherMember = new User
		{
			Id = Guid.NewGuid(),
			IsActive = true,
			Role = RoleTypes.User
		};

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
			UserId = otherMember.Id,
			User = otherMember,
			IsAdmin = false,
			JoinedAt = DateTime.UtcNow
		}
		};

		TestSpace.UserSpaces = SpaceMembers;

		var spaceDbSet = new List<Space> { TestSpace }.BuildMockDbSet();
		var userDbSet = new List<User> { CurrentUser, otherMember }.BuildMockDbSet();
		var userSpaceDbSet = SpaceMembers.BuildMockDbSet();

		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);
		MockDbContext.Setup(db => db.Set<User>()).Returns(userDbSet.Object);
		MockDbContext.Setup(db => db.Set<UserSpace>()).Returns(userSpaceDbSet.Object);

		return this;
	}

	public AddMemberToSpaceCommandHandlerTestFixture WithInactiveSpace()
	{
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Inactive Space",
			IsActive = false
		};

		var spaceDbSet = new List<Space> { TestSpace }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);

		return this;
	}

	public AddMemberToSpaceCommandHandlerTestFixture WithNoSpace()
	{
		var spaceDbSet = new List<Space>().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);

		return this;
	}

	public AddMemberToSpaceCommandHandlerTestFixture WithCurrentUser(RoleTypes? role = RoleTypes.User)
	{
		if (CurrentUser == null)
		{
			CurrentUser = new User
			{
				Id = Guid.NewGuid(),
				IsActive = true,
				Role = role ?? RoleTypes.User
			};
		}

		MockCurrentUserService.Setup(c => c.UserId).Returns(CurrentUser.Id);
		MockCurrentUserService.Setup(c => c.Role).Returns(role);
		return this;
	}

	public AddMemberToSpaceCommandHandlerTestFixture WithSuccessfulSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		return this;
	}

	public AddMemberToSpaceCommandHandlerTestFixture WithFailedSave()
	{
		MockDbContext
			.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ThrowsAsync(new Exception("Database save failed"));

		return this;
	}

	public AddMemberToSpaceCommandHandler BuildHandler()
	{
		return new AddMemberToSpaceCommandHandler(
			MockDbContext.Object,
			MockCurrentUserService.Object,
			MockDataProvider.Object);
	}

	public AddMemberToSpaceCommand CreateValidCommand()
	{
		return new AddMemberToSpaceCommand(TestSpace?.Id ?? Guid.NewGuid(), Guid.NewGuid(), false);
	}
}
