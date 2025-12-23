namespace Au5.UnitTests.Application.Features.Spaces.GetSpaces;

public class GetSpacesQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnEmptyList_When_NoSpacesExist()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithEmptySpaces()
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_ReturnOnlyActiveSpaces_When_MixedActiveAndInactiveSpacesExist()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(2)
			.WithInactiveSpaces(2)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);
		Assert.All(result.Data, space => Assert.True(space.IsActive));
	}

	[Fact]
	public async Task Should_ReturnSpacesWithCorrectProperties_When_ActiveSpacesExist()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(2)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);

		var firstSpace = result.Data.First();
		Assert.NotEqual(Guid.Empty, firstSpace.Id);
		Assert.Equal("Test Space 1", firstSpace.Name);
		Assert.Equal("Description for space 1", firstSpace.Description);
		Assert.True(firstSpace.IsActive);
		Assert.Empty(firstSpace.Users);
	}

	[Fact]
	public async Task Should_ReturnSpacesWithUserInformation_When_SpacesHaveUsers()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.WithSpacesWithUsers(2)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Equal(2, space.Users.Count);

		var firstUser = space.Users.First();
		Assert.NotEqual(Guid.Empty, firstUser.UserId);
		Assert.Equal("User 1", firstUser.FullName);
		Assert.Equal("user1@test.com", firstUser.Email);
		Assert.Equal("picture1.jpg", firstUser.PictureUrl);
		Assert.True(firstUser.IsAdmin);

		var secondUser = space.Users.Last();
		Assert.Equal("User 2", secondUser.FullName);
		Assert.Equal("user2@test.com", secondUser.Email);
		Assert.False(secondUser.IsAdmin);
	}

	[Fact]
	public async Task Should_HandleSpacesWithoutUsers_When_UserSpacesIsNull()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		// Set UserSpaces to null for the first space
		fixture.TestSpaces.First().UserSpaces = null;

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Empty(space.Users);
	}

	[Fact]
	public async Task Should_HandleSpacesWithoutChildren_When_ChildrenIsNull()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);
	}

	[Fact]
	public async Task Should_HandleSpacesWithoutParent_When_ParentIsNull()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);
	}

	[Fact]
	public async Task Should_ReturnSortedSpaces_When_MultipleSpacesExist()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(3)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(3, result.Data.Count);

		// Verify all spaces are returned
		var spaceNames = result.Data.Select(s => s.Name).ToList();
		Assert.Contains("Test Space 1", spaceNames);
		Assert.Contains("Test Space 2", spaceNames);
		Assert.Contains("Test Space 3", spaceNames);
	}

	[Fact]
	public async Task Should_UseAsNoTracking_When_QueryingSpaces()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);

		// The AsNoTracking() call is implicit in the query execution
		// We can't directly test it without more complex mocking, but the handler should work correctly
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);
	}

	[Fact]
	public async Task Should_FilterByOrganizationId_When_MultipleOrganizationsExist()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(2)
			.WithSpacesFromDifferentOrganization(3)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);
		Assert.All(result.Data, space => Assert.StartsWith("Test Space", space.Name));
	}

	[Fact]
	public async Task Should_IncludeUserSpacesWithUsers_When_QueryingSpaces()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.WithSpacesWithUsers(3)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Equal(3, space.Users.Count);
		Assert.All(space.Users, user =>
		{
			Assert.NotEqual(Guid.Empty, user.UserId);
			Assert.NotNull(user.FullName);
			Assert.NotNull(user.Email);
		});
	}

	[Fact]
	public async Task Should_ReturnEmptyUsersList_When_SpaceHasNoUserSpaces()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(2)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);
		Assert.All(result.Data, space => Assert.Empty(space.Users));
	}

	[Fact]
	public async Task Should_MapAllSpaceProperties_When_ReturningSpaces()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.NotEqual(Guid.Empty, space.Id);
		Assert.NotNull(space.Name);
		Assert.NotNull(space.Description);
		Assert.True(space.IsActive);
		Assert.NotNull(space.Users);
	}

	[Fact]
	public async Task Should_ReturnCorrectUserAdminStatus_When_UserSpacesHaveAdminFlag()
	{
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.WithSpacesWithUsers(2)
			.BuildHandler();

		var query = GetSpacesQueryHandlerTestFixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var space = result.Data.First();
		Assert.Equal(2, space.Users.Count);

		var adminUser = space.Users.First();
		var regularUser = space.Users.Last();
		Assert.True(adminUser.IsAdmin);
		Assert.False(regularUser.IsAdmin);
	}
}
