using Au5.Application.Features.Spaces.RemoveMemberFromSpace;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.IntegrationTests.TestHelpers;
using Microsoft.EntityFrameworkCore;

namespace Au5.IntegrationTests.Application.Features.Spaces;

public class RemoveMemberFromSpaceCommandHandlerTests : BaseIntegrationTest
{
	public RemoveMemberFromSpaceCommandHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Handle_Should_RemoveMemberSuccessfully_When_AdminUser()
	{
		var now = DateTime.UtcNow;

		var adminUser = TestUserFactory.Create("Admin User", "admin@example.com", now, role: RoleTypes.Admin);
		var memberToRemove = TestUserFactory.Create("Member To Remove", "member@example.com", now);
		var otherMember = TestUserFactory.Create("Other Member", "other@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Space Remove Test",
			IsActive = true,
			UserSpaces =
			[
			    	new() { User = adminUser, IsAdmin = true, JoinedAt = now },
					new() { User = memberToRemove, IsAdmin = false, JoinedAt = now },
					new() { User = otherMember, IsAdmin = false, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(adminUser, memberToRemove, otherMember);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = adminUser.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new RemoveMemberFromSpaceCommand(space.Id, memberToRemove.Id);

		var result = await Mediator.Send(command);

		Assert.True(result.IsSuccess);
		Assert.Equal("User successfully removed from space", result.Data!.Message);

		var removedUserSpace = await DbContext.Set<UserSpace>()
			.FirstOrDefaultAsync(us => us.SpaceId == space.Id && us.UserId == memberToRemove.Id);

		Assert.Null(removedUserSpace);
	}

	[Fact]
	public async Task Handle_Should_ReturnAccessDenied_When_NonAdminUserTriesToRemove()
	{
		var now = DateTime.UtcNow;

		var normalUser = TestUserFactory.Create("Normal User", "user@example.com", now);
		var targetUser = TestUserFactory.Create("Target User", "target@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Restricted Space",
			IsActive = true,
			UserSpaces =
			[
				new() { User = normalUser, IsAdmin = false, JoinedAt = now },
					new() { User = targetUser, IsAdmin = false, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(normalUser, targetUser);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = normalUser.Id;
		TestCurrentUserService.Role = RoleTypes.User;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new RemoveMemberFromSpaceCommand(space.Id, targetUser.Id);

		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
	}

	[Fact]
	public async Task Handle_Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var now = DateTime.UtcNow;
		var admin = TestUserFactory.Create("Admin User", "admin@example.com", now, role: RoleTypes.Admin);
		var member = TestUserFactory.Create("Member", "member@example.com", now);

		DbContext.Set<User>().AddRange(admin, member);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = admin.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new RemoveMemberFromSpaceCommand(Guid.NewGuid(), member.Id);

		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Handle_Should_ReturnNotFound_When_MemberNotInSpace()
	{
		var now = DateTime.UtcNow;
		var admin = TestUserFactory.Create("Admin", "admin@example.com", now, role: RoleTypes.Admin);
		var member = TestUserFactory.Create("Member", "member@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Space Missing Member",
			IsActive = true,
			UserSpaces =
			[
				new() { User = admin, IsAdmin = true, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(admin, member);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		TestCurrentUserService.UserId = admin.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new RemoveMemberFromSpaceCommand(space.Id, member.Id);

		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal("UserSpace.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Handle_Should_ThrowException_When_SaveFails()
	{
		var now = DateTime.UtcNow;

		var adminUser = TestUserFactory.Create("Admin", "admin@example.com", now, role: RoleTypes.Admin);
		var member = TestUserFactory.Create("Member", "member@example.com", now);

		var space = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Failing Save Space",
			IsActive = true,
			UserSpaces =
			[
				new() { User = adminUser, IsAdmin = true, JoinedAt = now },
				new() { User = member, IsAdmin = false, JoinedAt = now }
			]
		};

		DbContext.Set<User>().AddRange(adminUser, member);
		DbContext.Set<Space>().Add(space);
		await DbContext.SaveChangesAsync(CancellationToken.None);

		await DbContext.DisposeAsync();

		TestCurrentUserService.UserId = adminUser.Id;
		TestCurrentUserService.Role = RoleTypes.Admin;
		TestCurrentUserService.IsAuthenticated = true;

		var command = new RemoveMemberFromSpaceCommand(space.Id, member.Id);

		await Assert.ThrowsAsync<ObjectDisposedException>(async () => await Mediator.Send(command));
	}
}
