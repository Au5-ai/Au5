using System.Net;
using Au5.Application.Common.Abstractions;
using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.UserManagement;
public class GetMyInfoQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly GetMyInfoQueryHandler _handler;

	public GetMyInfoQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_handler = new GetMyInfoQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnsParticipant_When_UserExistsAndActive()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			FullName = "Test User",
			PictureUrl = "http://pic",
			Email = "mha.karimi@gmail.com",
			IsActive = true
		};

		var dbSet = new List<User> { user }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new GetMyInfoQuery(userId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(userId, result.Data.Id);
		Assert.Equal("Test User", result.Data.FullName);
		Assert.Equal("http://pic", result.Data.PictureUrl);
		Assert.Equal("mha.karimi@gmail.com", result.Data.Email);
		Assert.True(result.Data.HasAccount);
	}

	[Fact]
	public async Task Should_ReturnsParticipant_When_UserExistsButNotActive()
	{
		var userId = Guid.NewGuid();
		var user = new User
		{
			Id = userId,
			FullName = "Test User",
			PictureUrl = "http://pic",
			IsActive = false
		};

		var dbSet = new List<User> { user }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new GetMyInfoQuery(userId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(AppResources.UnAuthorizedAction, result.Error.Description);
	}

	[Fact]
	public async Task Handle_UserNotFound_ReturnsUnauthorizedError()
	{
		var userId = Guid.NewGuid();

		var dbSet = new List<User> { }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new GetMyInfoQuery(userId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
		Assert.Equal(AppResources.UnAuthorizedAction, result.Error.Description);
	}
}
