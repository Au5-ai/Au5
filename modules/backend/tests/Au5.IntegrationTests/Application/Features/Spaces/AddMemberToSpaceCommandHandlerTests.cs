using Au5.Application.Features.Spaces.AddMemberToSpace;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.IntegrationTests.TestHelpers;
using Microsoft.EntityFrameworkCore;

namespace Au5.IntegrationTests.Application.Features.Spaces;

public class AddMemberToSpaceCommandHandlerIntegrationTests : BaseIntegrationTest
{
	public AddMemberToSpaceCommandHandlerIntegrationTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Handle_Should_AddMemberSuccessfully_When_AdminUser()
	{
		var now = DateTime.UtcNow;

		var adminUser = TestUserFactory.Create("Admin User", "admin@example.com", now, role: RoleTypes.Admin);
		var newMember = TestUserFactory.Create("New Member", "newmember@example.com", now);
		var existingMember = TestUserFactory.Create("Existing Member", "existing@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Integration Test Space",
			IsActive = true,
			UserSpaces =
			[
				new() { User = adminUser, IsAdmin = true, JoinedAt = now },
					new() { User = existingMember, IsAdmin = false, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(adminUser, newMember, existingMember);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = adminUser.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new AddMemberToSpaceCommand(space.Id, newMember.Id, false);

		var result = await Mediator.Send(command);

		Assert.True(result.IsSuccess, "Expected successful result when admin adds a member.");
		Assert.NotNull(result.Data);
		Assert.Equal("User successfully added to space", result.Data!.Message);

		var addedUserSpace = await DbContext.Set<UserSpace>()
			.FirstOrDefaultAsync(us => us.SpaceId == space.Id && us.UserId == newMember.Id);

		Assert.NotNull(addedUserSpace);
		Assert.False(addedUserSpace!.IsAdmin);
	}

	[Fact]
	public async Task Handle_Should_ReturnAccessDenied_When_NonAdminTriesToAdd()
	{
		var now = DateTime.UtcNow;

		var normalUser = TestUserFactory.Create("Normal User", "user@example.com", now);
		var newMember = TestUserFactory.Create("New Member", "new@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Restricted Space",
			IsActive = true,
			UserSpaces =
			[
				new() { User = normalUser, IsAdmin = false, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(normalUser, newMember);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = normalUser.Id;
		TestCurrentUserService.Role = RoleTypes.User;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new AddMemberToSpaceCommand(space.Id, newMember.Id, false);

		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
	}

	[Fact]
	public async Task Handle_Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var now = DateTime.UtcNow;
		var admin = TestUserFactory.Create("Admin User", "admin@example.com", now, role: RoleTypes.Admin);
		var newMember = TestUserFactory.Create("New Member", "new@example.com", now);

		DbContext.Set<User>().AddRange(admin, newMember);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = admin.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new AddMemberToSpaceCommand(Guid.NewGuid(), newMember.Id, false);

		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Handle_Should_ReturnFailure_When_SaveChangesFails()
	{
		var now = DateTime.UtcNow;
		var adminUser = TestUserFactory.Create("Admin", "admin@example.com", now, role: RoleTypes.Admin);
		var newMember = TestUserFactory.Create("Member", "member@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Save Fail Space",
			IsActive = true,
			UserSpaces =
			[
				new() { User = adminUser, IsAdmin = true, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(adminUser, newMember);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		await DbContext.DisposeAsync();

		TestCurrentUserService.UserId = adminUser.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new AddMemberToSpaceCommand(space.Id, newMember.Id, false);

		await Assert.ThrowsAsync<ObjectDisposedException>(async () => await Mediator.Send(command));
	}
}
