using Au5.Application.Features.Spaces.RemoveMemberFromSpace;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.RemoveMemberFromSpace;

public class RemoveMemberFromSpaceCommandHandlerTests
{
	[Fact]
	public async Task Should_RemoveMemberSuccessfully_When_AdminUser()
	{
		var fixture = new RemoveMemberFromSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: true)
			.WithCurrentUser(RoleTypes.Admin)
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand();
		var handler = fixture.BuildHandler();

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		fixture.MockDbContext.Verify(db => db.Set<UserSpace>().Remove(It.IsAny<UserSpace>()), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnForbidden_When_UserIsNotAdmin()
	{
		var fixture = new RemoveMemberFromSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: false)
			.WithCurrentUser(RoleTypes.User)
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand();
		var handler = fixture.BuildHandler();

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var fixture = new RemoveMemberFromSpaceCommandHandlerTestFixture();
		fixture.MockDbContext.Setup(db => db.Set<Space>())
			.Returns(new List<Space>().BuildMockDbSet().Object);

		var handler = fixture.BuildHandler();
		var command = new RemoveMemberFromSpaceCommand(Guid.NewGuid(), Guid.NewGuid());

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_UserNotMember()
	{
		var fixture = new RemoveMemberFromSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: true)
			.WithCurrentUser(RoleTypes.Admin)
			.WithSuccessfulSave();

		var command = new RemoveMemberFromSpaceCommand(fixture.TestSpace.Id, Guid.NewGuid());
		var handler = fixture.BuildHandler();

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.InvalidUsers", result.Error.Code);
	}

	[Fact]
	public async Task Should_ThrowException_When_SaveChangesFails()
	{
		var fixture = new RemoveMemberFromSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: true)
			.WithCurrentUser(RoleTypes.Admin)
			.WithFailedSave();

		var command = fixture.CreateValidCommand();
		var handler = fixture.BuildHandler();

		var exception = await Assert.ThrowsAsync<Exception>(async () => await handler.Handle(command, CancellationToken.None));
		Assert.Equal("Database save failed", exception.Message);
	}
}
