using Au5.Application.Features.UserManagement.Search;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement;

public class SearchUserQueryHandlerTests
{
	[Fact]
	public async Task Should_ExcludeInactiveUsers_FromSearchResults()
	{
		var users = new List<User>
		{
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi", Email = "mo@example.com", IsActive = true },
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi", Email = "mo2@example.com", IsActive = false },
			new() { Id = Guid.NewGuid(), FullName = "Ali", Email = "ali@example.com", IsActive = true }
		};
		var mockSet = users.BuildMockDbSet();
		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<User>()).Returns(mockSet.Object);

		var handler = new SearchUserQueryHandler(mockContext.Object);
		var query = new SearchUserQuery("Mo Karimi");

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Single(result);
		Assert.Equal("mo@example.com", result.First().Email);
	}

	[Fact]
	public async Task Should_ReturnEmpty_When_ThereIsNoResult()
	{
		var users = new List<User>
		{
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi", Email = "mo@example.com", IsActive = true },
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi1", Email = "mo1@example.com", IsActive = true }
		};
		var mockSet = users.BuildMockDbSet();
		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<User>()).Returns(mockSet.Object);

		var handler = new SearchUserQueryHandler(mockContext.Object);
		var query = new SearchUserQuery("mo2@ex");

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_ReturnEmpty_When_NeitherFullNameNorEmailProvided()
	{
		var users = new List<User>
		{
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi", Email = "mo@example.com", IsActive = true }
		};
		var mockSet = users.BuildMockDbSet();
		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<User>()).Returns(mockSet.Object);

		var handler = new SearchUserQueryHandler(mockContext.Object);
		var query = new SearchUserQuery(string.Empty);

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Empty(result);
	}

	[Fact]
	public async Task Should_FilterByEmailOnly_When_FullNameIsNull_PartialEmail()
	{
		var users = new List<User>
		{
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi", Email = "mo@example.com", IsActive = true },
			new() { Id = Guid.NewGuid(), FullName = "Ali", Email = "ali@example.com", IsActive = true }
		};
		var mockSet = users.BuildMockDbSet();
		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<User>()).Returns(mockSet.Object);

		var handler = new SearchUserQueryHandler(mockContext.Object);
		var query = new SearchUserQuery("mo@ex");

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Single(result);
		Assert.Equal("Mo Karimi", result.First().FullName);
	}

	[Fact]
	public async Task Should_FilterByFullNameOnly_When_EmailIsNull_PartialFullName()
	{
		var users = new List<User>
		{
			new() { Id = Guid.NewGuid(), FullName = "Mo Karimi", Email = "mo@example.com", IsActive = true },
			new() { Id = Guid.NewGuid(), FullName = "Ali", Email = "ali@example.com", IsActive = true }
		};
		var mockSet = users.BuildMockDbSet();
		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<User>()).Returns(mockSet.Object);

		var handler = new SearchUserQueryHandler(mockContext.Object);
		var query = new SearchUserQuery("Mo Kar");

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.Single(result);
		Assert.Equal("Mo Karimi", result.First().FullName);
	}
}
