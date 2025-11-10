using Au5.Application.Features.Spaces.GetSpaceMembers;
using Au5.Domain.Entities;
using Au5.IntegrationTests.TestHelpers;

namespace Au5.IntegrationTests.Application.Features.Spaces
{
	public class GetSpaceMembersQueryHandlerIntegrationTests : BaseIntegrationTest
	{
		public GetSpaceMembersQueryHandlerIntegrationTests(IntegrationTestWebApp webApp)
			: base(webApp)
		{
		}

		[Fact]
		public async Task Handle_Should_ReturnUsers_When_CurrentUserHasAccess()
		{
			var now = DateTime.UtcNow;
			var user1 = TestUserFactory.Create("User 1", "user1@example.com", now);
			var user2 = TestUserFactory.Create("User 2", "user2@example.com", now);
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = "Integration Test Space",
				Description = "Space for integration test",
				IsActive = true,
				UserSpaces =
				[
					new() { User = user1, IsAdmin = true, JoinedAt = now },
					new() { User = user2, IsAdmin = false, JoinedAt = now }
				]
			};

			DbContext.Set<Space>().Add(space);
			await DbContext.SaveChangesAsync(CancellationToken.None);

			TestCurrentUserService.UserId = user1.Id;
			TestCurrentUserService.IsAuthenticated = true;

			var query = new GetSpaceMembersQuery(space.Id);
			var result = await Mediator.Send(query);

			Assert.True(result.IsSuccess);
			Assert.NotNull(result.Data);
			Assert.Equal(2, result.Data!.Users.Count);

			foreach (var member in result.Data.Users)
			{
				Assert.Contains(member.UserId, new[] { user1.Id, user2.Id });
				Assert.NotNull(member.FullName);
				Assert.NotNull(member.Email);
			}
		}

		[Fact]
		public async Task Handle_Should_ReturnAccessDenied_When_CurrentUserHasNoAccess()
		{
			var now = DateTime.UtcNow;
			var user1 = TestUserFactory.Create("User 1", "user1@example.com", now);
			var user2 = TestUserFactory.Create("User 2", "user2@example.com", now);
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = "Integration Test Space",
				IsActive = true,
				UserSpaces =
				[
					new () { User = user1, IsAdmin = true, JoinedAt = now },
					new () { User = user2, IsAdmin = false, JoinedAt = now }
				]
			};

			DbContext.Set<Space>().Add(space);
			await DbContext.SaveChangesAsync(CancellationToken.None);

			TestCurrentUserService.UserId = Guid.NewGuid();
			TestCurrentUserService.IsAuthenticated = true;

			var query = new GetSpaceMembersQuery(space.Id);
			var result = await Mediator.Send(query);

			Assert.False(result.IsSuccess);
			Assert.Equal("Space.Access.Denied", result.Error.Code);
		}

		[Fact]
		public async Task Handle_Should_GrantAccessAndFilter_When_CurrentUserIsMemberButInactive()
		{
			var now = DateTime.UtcNow;
			var user1 = TestUserFactory.Create("User 1", "user1@example.com", now, isActive: false);
			var user2 = TestUserFactory.Create("User 2", "user2@example.com", now);
			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = "Test Space",
				IsActive = true,
				UserSpaces =
				[
					new() { User = user1, IsAdmin = true, JoinedAt = now },
					new() { User = user2, IsAdmin = false, JoinedAt = now }
				]
			};
			DbContext.Set<Space>().Add(space);
			await DbContext.SaveChangesAsync(CancellationToken.None);

			TestCurrentUserService.UserId = user1.Id;
			TestCurrentUserService.IsAuthenticated = true;

			var query = new GetSpaceMembersQuery(space.Id);
			var result = await Mediator.Send(query);

			Assert.True(result.IsSuccess);
			Assert.NotNull(result.Data);
			Assert.Single(result.Data!.Users);
			Assert.Equal(user2.Id, result.Data.Users.First().UserId);
		}
	}
}
