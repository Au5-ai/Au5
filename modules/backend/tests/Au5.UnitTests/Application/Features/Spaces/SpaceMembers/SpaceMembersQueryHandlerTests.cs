using Au5.Application.Features.Spaces.SpaceMembers;

namespace Au5.UnitTests.Application.Features.Spaces.SpaceMembers;

public class SpaceMembersQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnUsers_When_CurrentUserHasAccess()
	{
		var fixture = new SpaceMembersQueryHandlerTestFixture()
			.WithActiveSpace()
			.WithUsers(3)
			.WithCurrentUser();

		var query = new SpaceMemebersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler()
			.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(3, result.Data!.Users.Count);
	}

	[Fact]
	public async Task Should_ReturnAccessDenied_When_CurrentUserNotMember()
	{
		var fixture = new SpaceMembersQueryHandlerTestFixture()
			.WithActiveSpace()
			.WithUsers(2)
			.WithCurrentUser(Guid.NewGuid());

		var query = new SpaceMemebersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler().Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceInactive()
	{
		var fixture = new SpaceMembersQueryHandlerTestFixture()
			.WithInactiveSpace()
			.WithUsers(2)
			.WithCurrentUser();

		var query = new SpaceMemebersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler().Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_GrantAccess_When_CurrentUserIsMemberButInactive()
	{
		var fixture = new SpaceMembersQueryHandlerTestFixture()
			.WithActiveSpace()
			.WithUsers(2, true);

		var currentUser = fixture.TestUsers.First(x => !x.IsActive);

		fixture.WithCurrentUser(currentUser.Id);

		var query = new SpaceMemebersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler().Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
	}
}
