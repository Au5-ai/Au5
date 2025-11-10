using Au5.Application.Features.Spaces.GetSpaceMembers;

namespace Au5.UnitTests.Application.Features.Spaces.GetSpaceMembers;

public class GetSpaceMembersQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnUsers_When_CurrentUserHasAccess()
	{
		var fixture = new GetSpaceMembersQueryHandlerTestFixture()
			.WithActiveSpace()
			.WithUsers(3)
			.WithCurrentUser();

		var query = new GetSpaceMembersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler()
			.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(3, result.Data!.Users.Count);
	}

	[Fact]
	public async Task Should_ReturnAccessDenied_When_CurrentUserNotMember()
	{
		var fixture = new GetSpaceMembersQueryHandlerTestFixture()
			.WithActiveSpace()
			.WithUsers(2)
			.WithCurrentUser(Guid.NewGuid());

		var query = new GetSpaceMembersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler().Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceInactive()
	{
		var fixture = new GetSpaceMembersQueryHandlerTestFixture()
			.WithInactiveSpace()
			.WithUsers(2)
			.WithCurrentUser();

		var query = new GetSpaceMembersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler().Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_GrantAccess_When_CurrentUserIsMemberButInactive()
	{
		var fixture = new GetSpaceMembersQueryHandlerTestFixture()
			.WithActiveSpace()
			.WithUsers(2);

		// Make the current user inactive
		var currentUser = fixture.TestUsers.First();
		currentUser.IsActive = false;

		fixture.WithCurrentUser(currentUser.Id);

		var query = new GetSpaceMembersQuery(fixture.TestSpace.Id);

		var result = await fixture.BuildHandler().Handle(query, CancellationToken.None);

		// Assert that access is granted, but the inactive user is not in the returned list
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data!.Users);
		Assert.NotEqual(currentUser.Id, result.Data.Users.First().UserId);
	}
}
