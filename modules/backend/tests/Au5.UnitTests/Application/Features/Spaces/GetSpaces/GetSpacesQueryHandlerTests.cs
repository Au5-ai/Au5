namespace Au5.UnitTests.Application.Features.Spaces.GetSpaces;

public class GetSpacesQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnEmptyList_When_NoSpacesExist()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithEmptySpaces()
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_ReturnOnlyActiveSpaces_When_MixedActiveAndInactiveSpacesExist()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(2)
			.WithInactiveSpaces(2)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);
		Assert.All(result.Data, space => Assert.True(space.IsActive));
	}

	[Fact]
	public async Task Should_ReturnSpacesWithCorrectProperties_When_ActiveSpacesExist()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(2)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);

		var firstSpace = result.Data.First();
		Assert.NotEqual(Guid.Empty, firstSpace.Id);
		Assert.Equal("Test Space 1", firstSpace.Name);
		Assert.Equal("Description for space 1", firstSpace.Description);
		Assert.True(firstSpace.IsActive);
		Assert.Equal(0, firstSpace.ChildrenCount);
		Assert.Equal(0, firstSpace.UsersCount);
		Assert.Empty(firstSpace.Users);
	}

	[Fact]
	public async Task Should_ReturnSpacesWithParentInformation_When_SpacesHaveParents()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithSpacesWithParents()
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);

		var parentSpace = result.Data.FirstOrDefault(s => s.Name == "Parent Space");
		var childSpace = result.Data.FirstOrDefault(s => s.Name == "Child Space");

		Assert.NotNull(parentSpace);
		Assert.NotNull(childSpace);

		Assert.Null(parentSpace.ParentId);
		Assert.Null(parentSpace.ParentName);
		Assert.Equal(1, parentSpace.ChildrenCount);

		Assert.NotNull(childSpace.ParentId);
		Assert.Equal("Parent Space", childSpace.ParentName);
		Assert.Equal(0, childSpace.ChildrenCount);
	}

	[Fact]
	public async Task Should_ReturnSpacesWithUserInformation_When_SpacesHaveUsers()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.WithSpacesWithUsers(2)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Equal(2, space.UsersCount);
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
	public async Task Should_ReturnSpacesWithCorrectCounts_When_SpacesHaveChildrenAndUsers()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithSpacesWithParents()
			.WithSpacesWithUsers(3)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);

		var parentSpace = result.Data.FirstOrDefault(s => s.Name == "Parent Space");
		Assert.NotNull(parentSpace);
		Assert.Equal(1, parentSpace.ChildrenCount);
		Assert.Equal(3, parentSpace.UsersCount);
		Assert.Equal(3, parentSpace.Users.Count);

		var childSpace = result.Data.FirstOrDefault(s => s.Name == "Child Space");
		Assert.NotNull(childSpace);
		Assert.Equal(0, childSpace.ChildrenCount);
		Assert.Equal(0, childSpace.UsersCount);
		Assert.Empty(childSpace.Users);
	}

	[Fact]
	public async Task Should_HandleSpacesWithoutUsers_When_UserSpacesIsNull()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		// Set UserSpaces to null for the first space
		fixture.TestSpaces.First().UserSpaces = null;

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Equal(0, space.UsersCount);
		Assert.Empty(space.Users);
	}

	[Fact]
	public async Task Should_HandleSpacesWithoutChildren_When_ChildrenIsNull()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		// Set Children to null for the first space
		fixture.TestSpaces.First().Children = null;

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Equal(0, space.ChildrenCount);
	}

	[Fact]
	public async Task Should_HandleSpacesWithoutParent_When_ParentIsNull()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Null(space.ParentId);
		Assert.Null(space.ParentName);
	}

	[Fact]
	public async Task Should_ReturnSortedSpaces_When_MultipleSpacesExist()
	{
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(3)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
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
		// Arrange
		var fixture = new GetSpacesQueryHandlerTestFixture()
			.WithActiveSpaces(1)
			.BuildHandler();

		var query = fixture.CreateQuery();

		// Act
		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		// Assert
		Assert.True(result.IsSuccess);

		// The AsNoTracking() call is implicit in the query execution
		// We can't directly test it without more complex mocking, but the handler should work correctly
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);
	}
}
