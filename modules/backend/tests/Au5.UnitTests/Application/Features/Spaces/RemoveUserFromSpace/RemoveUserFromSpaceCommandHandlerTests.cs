using Au5.Application.Features.Spaces.RemoveUserFromSpace;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.RemoveUserFromSpace;

public class RemoveUserFromSpaceCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly RemoveUserFromSpaceCommandHandler _handler;
	private readonly Guid _userId;
	private readonly Guid _organizationId;

	public RemoveUserFromSpaceCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_userId = Guid.NewGuid();
		_organizationId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(_userId);
		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(_organizationId);

		_handler = new RemoveUserFromSpaceCommandHandler(
			_dbContextMock.Object,
			_currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_UserRemovesThemselves()
	{
		var spaceId = Guid.NewGuid();
		var userSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { userSpace }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var userSpaces = new List<UserSpace> { userSpace }.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<UserSpace>()).Returns(userSpaces.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new RemoveUserFromSpaceCommand
		{
			SpaceId = spaceId,
			UserId = _userId
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		userSpaces.Verify(x => x.Remove(It.IsAny<UserSpace>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_AdminRemovesAnotherUser()
	{
		var spaceId = Guid.NewGuid();
		var targetUserId = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var targetUserSpace = new UserSpace { UserId = targetUserId, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace, targetUserSpace }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var userSpaces = new List<UserSpace> { currentUserSpace, targetUserSpace }.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<UserSpace>()).Returns(userSpaces.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new RemoveUserFromSpaceCommand
		{
			SpaceId = spaceId,
			UserId = targetUserId
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		userSpaces.Verify(x => x.Remove(It.IsAny<UserSpace>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var spaceId = Guid.NewGuid();
		var spaces = new List<Space>().BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);

		var command = new RemoveUserFromSpaceCommand
		{
			SpaceId = spaceId,
			UserId = _userId
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
		Assert.Equal(AppResources.Space.NotFoundMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_TargetUserIsNotInSpace()
	{
		var spaceId = Guid.NewGuid();
		var targetUserId = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);

		var command = new RemoveUserFromSpaceCommand
		{
			SpaceId = spaceId,
			UserId = targetUserId
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.UserNotInSpace", result.Error.Code);
		Assert.Equal(AppResources.Space.UserNotInSpaceMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnForbidden_When_NonAdminTriesToRemoveAnotherUser()
	{
		var spaceId = Guid.NewGuid();
		var targetUserId = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = false };
		var targetUserSpace = new UserSpace { UserId = targetUserId, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace, targetUserSpace }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);

		var command = new RemoveUserFromSpaceCommand
		{
			SpaceId = spaceId,
			UserId = targetUserId
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NoPermission", result.Error.Code);
		Assert.Equal(AppResources.Space.NoPermissionMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var spaceId = Guid.NewGuid();
		var userSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { userSpace }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var userSpaces = new List<UserSpace> { userSpace }.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<UserSpace>()).Returns(userSpaces.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure("Database.Error", "Database error")));

		var command = new RemoveUserFromSpaceCommand
		{
			SpaceId = spaceId,
			UserId = _userId
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.FailedToRemoveUser", result.Error.Code);
		Assert.Equal(AppResources.Space.RemoveUserFailedMessage, result.Error.Description);
	}
}
