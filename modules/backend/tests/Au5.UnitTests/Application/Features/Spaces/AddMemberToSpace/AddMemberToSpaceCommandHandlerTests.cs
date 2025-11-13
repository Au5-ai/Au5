using Au5.Application.Features.Spaces.AddMemberToSpace;
using Au5.Domain.Entities;

namespace Au5.UnitTests.Application.Features.Spaces.AddMemberToSpace;

public class AddMemberToSpaceCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var fixture = new AddMemberToSpaceCommandHandlerTestFixture()
			.WithNoSpace()
			.WithCurrentUser()
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand();
		var handler = fixture.BuildHandler();

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnForbidden_When_UserIsNotAdmin()
	{
		var fixture = new AddMemberToSpaceCommandHandlerTestFixture()
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
	public async Task Should_ReturnBadRequest_When_UserAlreadyMember()
	{
		var fixture = new AddMemberToSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: true)
			.WithCurrentUser(RoleTypes.Admin)
			.WithSuccessfulSave();

		var existingMemberId = fixture.SpaceMembers.First().UserId;
		var command = new AddMemberToSpaceCommand(fixture.TestSpace.Id, existingMemberId, false);

		var handler = fixture.BuildHandler();
		var result = await handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("User is already an active member.", result.Error.Description);
	}

	[Fact]
	public async Task Should_AddMemberSuccessfully_When_ValidAdminUser()
	{
		var fixture = new AddMemberToSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: true)
			.WithCurrentUser(RoleTypes.Admin)
			.WithSuccessfulSave();

		var command = fixture.CreateValidCommand();
		var handler = fixture.BuildHandler();

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		fixture.MockDbContext.Verify(db => db.Set<UserSpace>().Add(It.IsAny<UserSpace>()), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var fixture = new AddMemberToSpaceCommandHandlerTestFixture()
			.WithActiveSpaceWithMembers(currentUserIsAdmin: true)
			.WithCurrentUser(RoleTypes.Admin)
			.WithFailedSave();

		var command = fixture.CreateValidCommand();
		var handler = fixture.BuildHandler();

		var exception = await Assert.ThrowsAsync<Exception>(async () => await handler.Handle(command, CancellationToken.None));

		Assert.Equal("Database save failed", exception.Message);
	}
}
