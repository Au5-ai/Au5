using Au5.Application.Features.Spaces.AddMembersToSpace;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.AddMembersToSpace;

public class AddMembersToSpaceCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly AddMembersToSpaceCommandHandler _handler;
	private readonly Guid _userId;
	private readonly Guid _organizationId;
	private readonly DateTime _now;

	public AddMembersToSpaceCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_dataProviderMock = new Mock<IDataProvider>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_userId = Guid.NewGuid();
		_organizationId = Guid.NewGuid();
		_now = DateTime.UtcNow;

		_currentUserServiceMock.Setup(x => x.UserId).Returns(_userId);
		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(_organizationId);
		_dataProviderMock.Setup(x => x.Now).Returns(_now);

		_handler = new AddMembersToSpaceCommandHandler(
			_dbContextMock.Object,
			_dataProviderMock.Object,
			_currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_AddingNewMembersToSpace()
	{
		var spaceId = Guid.NewGuid();
		var newUser1 = Guid.NewGuid();
		var newUser2 = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace }
		};

		var users = new List<User>
		{
			new() { Id = newUser1, OrganizationId = _organizationId, IsActive = true },
			new() { Id = newUser2, OrganizationId = _organizationId, IsActive = true }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var usersDbSet = users.BuildMockDbSet();
		var userSpaces = new List<UserSpace>().BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<User>()).Returns(usersDbSet.Object);
		_dbContextMock.Setup(x => x.Set<UserSpace>()).Returns(userSpaces.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = newUser1, IsAdmin = false },
				new() { UserId = newUser2, IsAdmin = true }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		userSpaces.Verify(
			x => x.AddRange(It.Is<IEnumerable<UserSpace>>(us => us.Count() == 2)),
			Times.Once);
	}

	[Fact]
	public async Task Should_ReturnValidation_When_UsersListIsNull()
	{
		var spaceId = Guid.NewGuid();

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = null
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NoUsers", result.Error.Code);
		Assert.Equal(AppResources.Space.NoUsersMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnValidation_When_UsersListIsEmpty()
	{
		var spaceId = Guid.NewGuid();

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>()
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NoUsers", result.Error.Code);
		Assert.Equal(AppResources.Space.NoUsersMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var spaceId = Guid.NewGuid();
		var spaces = new List<Space>().BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = Guid.NewGuid(), IsAdmin = false }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NotFound", result.Error.Code);
		Assert.Equal(AppResources.Space.NotFoundMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnForbidden_When_CurrentUserIsNotAdmin()
	{
		var spaceId = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = Guid.NewGuid(), IsAdmin = false }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.NoPermission", result.Error.Code);
		Assert.Equal(AppResources.Space.NoPermissionMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnValidation_When_SomeUsersDoNotExist()
	{
		var spaceId = Guid.NewGuid();
		var existingUser = Guid.NewGuid();
		var nonExistentUser = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace }
		};

		var users = new List<User>
		{
			new() { Id = existingUser, OrganizationId = _organizationId, IsActive = true }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var usersDbSet = users.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<User>()).Returns(usersDbSet.Object);

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = existingUser, IsAdmin = false },
				new() { UserId = nonExistentUser, IsAdmin = false }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.InvalidUsers", result.Error.Code);
		Assert.Equal(AppResources.Space.InvalidUsersMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnValidation_When_AllUsersAreAlreadyMembers()
	{
		var spaceId = Guid.NewGuid();
		var existingMember1 = Guid.NewGuid();
		var existingMember2 = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var userSpace1 = new UserSpace { UserId = existingMember1, SpaceId = spaceId, IsAdmin = false };
		var userSpace2 = new UserSpace { UserId = existingMember2, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace, userSpace1, userSpace2 }
		};

		var users = new List<User>
		{
			new() { Id = existingMember1, OrganizationId = _organizationId, IsActive = true },
			new() { Id = existingMember2, OrganizationId = _organizationId, IsActive = true }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var usersDbSet = users.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<User>()).Returns(usersDbSet.Object);

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = existingMember1, IsAdmin = false },
				new() { UserId = existingMember2, IsAdmin = false }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.AllUsersAlreadyMembers", result.Error.Code);
		Assert.Equal(AppResources.Space.AllUsersAlreadyMembersMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_AddOnlyNewMembers_When_SomeUsersAreAlreadyMembers()
	{
		var spaceId = Guid.NewGuid();
		var existingMember = Guid.NewGuid();
		var newMember = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var existingUserSpace = new UserSpace { UserId = existingMember, SpaceId = spaceId, IsAdmin = false };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace, existingUserSpace }
		};

		var users = new List<User>
		{
			new() { Id = existingMember, OrganizationId = _organizationId, IsActive = true },
			new() { Id = newMember, OrganizationId = _organizationId, IsActive = true }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var usersDbSet = users.BuildMockDbSet();
		var userSpaces = new List<UserSpace>().BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<User>()).Returns(usersDbSet.Object);
		_dbContextMock.Setup(x => x.Set<UserSpace>()).Returns(userSpaces.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = existingMember, IsAdmin = false },
				new() { UserId = newMember, IsAdmin = false }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		userSpaces.Verify(
			x => x.AddRange(It.Is<IEnumerable<UserSpace>>(
				us => us.Count() == 1 && us.First().UserId == newMember)),
			Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var spaceId = Guid.NewGuid();
		var newUser = Guid.NewGuid();
		var currentUserSpace = new UserSpace { UserId = _userId, SpaceId = spaceId, IsAdmin = true };
		var space = new Space
		{
			Id = spaceId,
			OrganizationId = _organizationId,
			IsActive = true,
			UserSpaces = new List<UserSpace> { currentUserSpace }
		};

		var users = new List<User>
		{
			new() { Id = newUser, OrganizationId = _organizationId, IsActive = true }
		};

		var spaces = new List<Space> { space }.BuildMockDbSet();
		var usersDbSet = users.BuildMockDbSet();
		var userSpaces = new List<UserSpace>().BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Space>()).Returns(spaces.Object);
		_dbContextMock.Setup(x => x.Set<User>()).Returns(usersDbSet.Object);
		_dbContextMock.Setup(x => x.Set<UserSpace>()).Returns(userSpaces.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure("Database.Error", "Database error")));

		var command = new AddMembersToSpaceCommand
		{
			SpaceId = spaceId,
			Users = new List<UserInSpace>
			{
				new() { UserId = newUser, IsAdmin = false }
			}
		};

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Space.FailedToAddMembers", result.Error.Code);
		Assert.Equal(AppResources.Space.AddMembersFailedMessage, result.Error.Description);
	}
}
