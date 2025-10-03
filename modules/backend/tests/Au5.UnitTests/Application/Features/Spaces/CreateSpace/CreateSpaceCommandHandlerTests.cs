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
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand(withParent: false, withUsers: false);

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.Equal("Test Space", result.Data.Name);
		Assert.Equal("Test Description", result.Data.Description);
		Assert.Null(result.Data.ParentId);
		Assert.Null(result.Data.ParentName);
		Assert.Equal(0, result.Data.UsersCount);
		Assert.Empty(result.Data.Users);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnParentNotFoundError_When_ParentSpaceDoesNotExist()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = Guid.NewGuid(), // Non-existent parent
			Users = []
		};

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.ParentNotFoundCode, result.Error.Code);
		Assert.Equal(SpaceResources.ParentNotFoundMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnParentNotFoundError_When_ParentSpaceIsInactive()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithInactiveParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = fixture.TestParentSpace.Id,
			Users = []
		};

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.ParentNotFoundCode, result.Error.Code);
		Assert.Equal(SpaceResources.ParentNotFoundMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnInvalidUsersError_When_SomeUsersDoNotExist()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(1)
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = null,
			Users =
			[
				new UserInSpace { UserId = fixture.TestUsers[0].Id, IsAdmin = true },
				new UserInSpace { UserId = Guid.NewGuid(), IsAdmin = false } // Non-existent user
			]
		};

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.InvalidUsersCode, result.Error.Code);
		Assert.Equal(SpaceResources.InvalidUsersMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnInvalidUsersError_When_SomeUsersAreInactive()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithValidUsers(1)
			.WithInactiveUser()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = null,
			Users =
			[
				new UserInSpace { UserId = fixture.TestUsers[0].Id, IsAdmin = true },
				new UserInSpace { UserId = fixture.TestUsers.Last().Id, IsAdmin = false } // Inactive user
			]
		};

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.InvalidUsersCode, result.Error.Code);
		Assert.Equal(SpaceResources.InvalidUsersMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnCreateFailedError_When_SaveChangesFails()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithFailedSave();

		var command = fixture.CreateValidCommand(withParent: false, withUsers: false);

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.CreateFailedCode, result.Error.Code);
		Assert.Equal(SpaceResources.CreateFailedMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_CreateSpaceWithoutUsers_When_UsersListIsNull()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = null,
			Users = null
		};

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.Equal("Test Space", result.Data.Name);
		Assert.Equal(0, result.Data.UsersCount);
		Assert.Empty(result.Data.Users);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Never);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_CreateSpaceWithoutUsers_When_UsersListIsEmpty()
	{
		// Arrange
		var fixture = new CreateSpaceCommandHandlerTestFixture()
			.WithNoParentSpace()
			.WithNoUsers()
			.WithSuccessfulSave();

		var command = new CreateSpaceCommand
		{
			Name = "Test Space",
			Description = "Test Description",
			ParentId = null,
			Users = []
		};

		// Act
		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.Equal("Test Space", result.Data.Name);
		Assert.Equal(0, result.Data.UsersCount);
		Assert.Empty(result.Data.Users);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Never);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}
}
