using System.Net;
using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Domain.Entities;
using MockQueryable.Moq;
using static Au5.UnitTests.Application.AppResources;

namespace Au5.UnitTests.Application.Features.UserManagement;
public class GetMyInfoQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly GetMyInfoQueryHandler _handler;

	public GetMyInfoQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_handler = new GetMyInfoQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);
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
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new GetMyInfoQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(userId, result.Data.Id);
		Assert.Equal("Test User", result.Data.FullName);
		Assert.Equal("http://pic", result.Data.PictureUrl);
		Assert.Equal("mha.karimi@gmail.com", result.Data.Email);
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
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new GetMyInfoQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(Auth.UnAuthorizedAction, result.Error.Description);
	}

	[Fact]
	public async Task Handle_UserNotFound_ReturnsUnauthorizedError()
	{
		var userId = Guid.NewGuid();

		var dbSet = new List<User> { }.BuildMockDbSet();
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new GetMyInfoQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
		Assert.Equal(Auth.UnAuthorizedAction, result.Error.Description);
	}
}
