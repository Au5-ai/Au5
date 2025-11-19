using Au5.Application.Features.Spaces.CreateSpace;
using Au5.Domain.Entities;
using SpaceEntity = Au5.Domain.Entities.Space;
using SpaceResources = Au5.UnitTests.Application.AppResources.Space;

namespace Au5.UnitTests.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnSuccessResponse_When_ValidSpaceWithoutParentAndUsers()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand(withUsers: false);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_CreateSpaceSuccessfully_When_ValidSpaceWithUsers()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(2)
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand(withUsers: true);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.NotEqual(Guid.Empty, result.Data.Id);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.Set<UserSpace>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnInvalidUsersError_When_SomeUsersDoNotExist()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(1)
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users =
			[
				new UserInSpace { UserId = fixture.TestUsers[0].Id, IsAdmin = true },
				new UserInSpace { UserId = Guid.NewGuid(), IsAdmin = false } // Non-existent user
			]
		};

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.InvalidUsersCode, result.Error.Code);
		Assert.Equal(SpaceResources.InvalidUsersMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnInvalidUsersError_When_SomeUsersAreInactive()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(1)
			.WithInactiveUser()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users =
			[
				new UserInSpace { UserId = fixture.TestUsers[0].Id, IsAdmin = true },
				new UserInSpace { UserId = fixture.TestUsers.Last().Id, IsAdmin = false } // Inactive user
			]
		};

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.InvalidUsersCode, result.Error.Code);
		Assert.Equal(SpaceResources.InvalidUsersMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnCreateFailedError_When_SaveChangesFails()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithFailedSave();

		var command = fixture.CreateValidCommand(withUsers: false);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.FailedToCreate", result.Error.Code);
		Assert.Equal(SpaceResources.CreateFailedMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_CreateSpaceWithoutUsers_When_UsersListIsNull()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users = null
		};

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Never);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_CreateSpaceWithoutUsers_When_UsersListIsEmpty()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users = []
		};

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Never);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_SetSpacePropertiesCorrectly_When_CreatingSpace()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "My Test Space",
			Description = "My Test Description",
			Users = null
		};

		SpaceEntity capturedSpace = null;
		fixture.MockDbContext.Setup(db => db.Set<SpaceEntity>().Add(It.IsAny<SpaceEntity>()))
			.Callback<SpaceEntity>(s => capturedSpace = s);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedSpace);
		Assert.Equal("My Test Space", capturedSpace.Name);
		Assert.Equal("My Test Description", capturedSpace.Description);
		Assert.True(capturedSpace.IsActive);
		Assert.NotEqual(Guid.Empty, capturedSpace.OrganizationId);
	}

	[Fact]
	public async Task Should_CreateUserSpacesWithCorrectProperties_When_UsersProvided()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(3)
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users =
			[
				new UserInSpace { UserId = fixture.TestUsers[0].Id, IsAdmin = true },
				new UserInSpace { UserId = fixture.TestUsers[1].Id, IsAdmin = false },
				new UserInSpace { UserId = fixture.TestUsers[2].Id, IsAdmin = false }
			]
		};

		List<UserSpace> capturedUserSpaces = null;
		fixture.MockDbContext.Setup(db => db.Set<UserSpace>().AddRange(It.IsAny<IEnumerable<UserSpace>>()))
			.Callback<IEnumerable<UserSpace>>(us => capturedUserSpaces = [.. us]);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedUserSpaces);
		Assert.Equal(3, capturedUserSpaces.Count);
		Assert.True(capturedUserSpaces[0].IsAdmin);
		Assert.False(capturedUserSpaces[1].IsAdmin);
		Assert.False(capturedUserSpaces[2].IsAdmin);
	}

	[Fact]
	public async Task Should_AssignOrganizationIdToSpace_When_CreatingSpace()
	{
		var organizationId = Guid.NewGuid();
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave()
			.WithOrganizationId(organizationId);

		var command = fixture.CreateValidCommand(withUsers: false);

		SpaceEntity capturedSpace = null;
		fixture.MockDbContext.Setup(db => db.Set<SpaceEntity>().Add(It.IsAny<SpaceEntity>()))
			.Callback<SpaceEntity>(s => capturedSpace = s);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedSpace);
		Assert.Equal(organizationId, capturedSpace.OrganizationId);
	}

	[Fact]
	public async Task Should_ValidateAllUsers_When_MultipleUsersProvided()
	{
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(5)
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			Users = [.. fixture.TestUsers.Select((u, i) => new UserInSpace
			{
				UserId = u.Id,
				IsAdmin = i == 0
			})]
		};

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Once);
	}
}
