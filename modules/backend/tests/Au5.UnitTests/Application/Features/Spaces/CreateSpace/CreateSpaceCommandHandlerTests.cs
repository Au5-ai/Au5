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

		var command = fixture.CreateValidCommand(withParent: false, withUsers: false);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnParentNotFoundError_When_ParentSpaceDoesNotExist()
	{
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

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.ParentNotFoundCode, result.Error.Code);
		Assert.Equal(SpaceResources.ParentNotFoundMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnParentNotFoundError_When_ParentSpaceIsInactive()
	{
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

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.ParentNotFoundCode, result.Error.Code);
		Assert.Equal(SpaceResources.ParentNotFoundMessage, result.Error.Description);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
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
			ParentId = null,
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
			ParentId = null,
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

		var command = fixture.CreateValidCommand(withParent: false, withUsers: false);

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(SpaceResources.CreateFailedCode, result.Error.Code);
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
			ParentId = null,
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
			ParentId = null,
			Users = []
		};

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);

		fixture.MockDbContext.Verify(db => db.Set<SpaceEntity>(), Times.AtLeastOnce);
		fixture.MockDbContext.Verify(db => db.Set<User>(), Times.Never);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}
}
