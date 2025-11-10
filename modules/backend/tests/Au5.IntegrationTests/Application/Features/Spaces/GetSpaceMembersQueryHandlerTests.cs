using Au5.Application.Features.Spaces.GetSpaceMembers;
using Au5.Domain.Common;
using Au5.Domain.Entities;

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
			var user1 = new User
			{
				Id = Guid.NewGuid(),
				FullName = "User 1",
				Email = "user1@example.com",
				PictureUrl = " ",
				Password = "FakePassword1!",
				IsActive = true,
				CreatedAt = DateTime.UtcNow,
				Role = RoleTypes.User,
				Status = UserStatus.CompleteSignUp
			};

			var user2 = new User
			{
				Id = Guid.NewGuid(),
				FullName = "User 2",
				Email = "user2@example.com",
				PictureUrl = " ",
				Password = "FakePassword2!",
				IsActive = true,
				CreatedAt = DateTime.UtcNow,
				Role = RoleTypes.User,
				Status = UserStatus.CompleteSignUp
			};

			DbContext.Set<User>().AddRange(user1, user2);
			await DbContext.SaveChangesAsync(CancellationToken.None);

			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = "Integration Test Space",
				Description = "Space for integration test",
				IsActive = true
			};

			DbContext.Set<Space>().Add(space);
			await DbContext.SaveChangesAsync(CancellationToken.None);

			var us1 = new UserSpace
			{
				SpaceId = space.Id,
				UserId = user1.Id,
				IsAdmin = true,
				JoinedAt = DateTime.UtcNow
			};
			var us2 = new UserSpace
			{
				SpaceId = space.Id,
				UserId = user2.Id,
				IsAdmin = false,
				JoinedAt = DateTime.UtcNow
			};

			DbContext.Set<UserSpace>().AddRange(us1, us2);
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
			var user1 = new User
			{
				Id = Guid.NewGuid(),
				FullName = "User 1",
				Email = "user1@example.com",
				PictureUrl = string.Empty,
				IsActive = true,
				CreatedAt = DateTime.UtcNow,
				Password = "FakePassword1!",
			};
			var user2 = new User
			{
				Id = Guid.NewGuid(),
				FullName = "User 2",
				Email = "user2@example.com",
				PictureUrl = string.Empty,
				IsActive = true,
				CreatedAt = DateTime.UtcNow,
				Password = "FakePassword2!",
			};

			DbContext.Set<User>().AddRange(user1, user2);
			await DbContext.SaveChangesAsync(CancellationToken.None);

			var space = new Space
			{
				Id = Guid.NewGuid(),
				Name = "Integration Test Space",
				IsActive = true,
				UserSpaces = new List<UserSpace>
				{
					new () { UserId = user1.Id, IsAdmin = true, JoinedAt = DateTime.UtcNow },
					new () { UserId = user2.Id, IsAdmin = false, JoinedAt = DateTime.UtcNow }
				}
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
	}
}
