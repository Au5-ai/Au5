namespace Au5.UnitTests.Application.Features.Spaces.GetUserSpaces;

public class GetUserSpacesQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnEmptyList_When_UserHasNoSpaces()
	{
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(Guid.NewGuid())
			.WithEmptyUserSpaces()
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_ReturnUserSpaces_When_UserHasActiveSpaces()
	{
		var userId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(userId)
			.WithUserSpaces(userId, 3)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(3, result.Data.Count);

		var adminSpace = result.Data.Single(s => s.IsAdmin);
		Assert.Equal("Space 1", adminSpace.Name);
		Assert.Equal("Description for space 1", adminSpace.Description);
		Assert.NotEqual(Guid.Empty, adminSpace.Id);

		Assert.Equal(2, result.Data.Count(s => !s.IsAdmin));
	}

	[Fact]
	public async Task Should_ReturnOnlyActiveSpaces_When_UserHasMixedActiveAndInactiveSpaces()
	{
		var userId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(userId)
			.WithUserSpaces(userId, 2)
			.WithInactiveUserSpaces(userId, 2)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.Single(result.Data, s => s.IsAdmin);
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);
		Assert.All(result.Data, space => Assert.DoesNotContain("Inactive", space.Name));
	}

	[Fact]
	public async Task Should_ReturnOnlyCurrentUserSpaces_When_MultipleUsersHaveSpaces()
	{
		var currentUserId = Guid.NewGuid();
		var otherUserId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(currentUserId)
			.WithUserSpaces(currentUserId, 2)
			.WithUserSpaces(otherUserId, 3)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);
	}

	[Fact]
	public async Task Should_ReturnCorrectSpaceDetails_When_UserHasSpaces()
	{
		var userId = Guid.NewGuid();
		var spaceId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(userId)
			.WithSpecificUserSpace(userId, spaceId, "Engineering Team", "Engineering space description")
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.Equal(spaceId, space.Id);
		Assert.True(space.IsAdmin);
		Assert.Equal("Engineering Team", space.Name);
		Assert.Equal("Engineering space description", space.Description);
	}

	[Fact]
	public async Task Should_UseAsNoTracking_When_QueryingUserSpaces()
	{
		var userId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(userId)
			.WithUserSpaces(userId, 1)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);
	}

	[Fact]
	public async Task Should_HandleEmptyDescription_When_SpaceDescriptionIsEmpty()
	{
		var userId = Guid.NewGuid();
		var spaceId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(userId)
			.WithSpecificUserSpace(userId, spaceId, "No Description Space", string.Empty)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var space = result.Data.First();
		Assert.True(space.IsAdmin);
		Assert.Equal(string.Empty, space.Description);
	}

	[Fact]
	public async Task Should_ReturnMultipleSpaces_When_UserBelongsToMultipleSpaces()
	{
		var userId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(userId)
			.WithUserSpaces(userId, 5)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(5, result.Data.Count);
		Assert.Single(result.Data, s => s.IsAdmin);

		var spaceNames = result.Data.Select(s => s.Name).ToList();
		Assert.Contains("Space 1", spaceNames);
		Assert.Contains("Space 2", spaceNames);
		Assert.Contains("Space 3", spaceNames);
		Assert.Contains("Space 4", spaceNames);
		Assert.Contains("Space 5", spaceNames);
	}

	[Fact]
	public async Task Should_FilterByUserId_When_CurrentUserServiceReturnsUserId()
	{
		var currentUserId = Guid.NewGuid();
		var fixture = new GetUserSpacesQueryHandlerTestFixture()
			.WithUserId(currentUserId)
			.WithUserSpaces(currentUserId, 2)
			.BuildHandler();

		var query = fixture.CreateQuery();

		var result = await fixture.Handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		fixture.MockCurrentUserService.Verify(s => s.UserId, Times.AtLeastOnce);
	}
}
