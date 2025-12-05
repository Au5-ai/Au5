using Au5.Application.Common.Options;
using Au5.Application.Features.Admin.Create;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Admin.Create;

public class CreateAdminCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _mockDbContext;
	private readonly Mock<DbSet<User>> _mockUserDbSet;
	private readonly Mock<DbSet<Organization>> _mockOrganizationDbSet;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _mockOrganizationOptions;
	private readonly CreateAdminCommandHandler _handler;

	public CreateAdminCommandHandlerTests()
	{
		_mockDbContext = new Mock<IApplicationDbContext>();
		_mockUserDbSet = new Mock<DbSet<User>>();
		_mockOrganizationDbSet = new Mock<DbSet<Organization>>();
		_dataProviderMock = new Mock<IDataProvider>();
		_mockOrganizationOptions = new Mock<IOptions<OrganizationOptions>>();

		_mockOrganizationOptions.Setup(x => x.Value).Returns(new OrganizationOptions
		{
			Direction = "ltr",
			Language = "en-US",
		});

		_mockDbContext.Setup(x => x.Set<User>())
			.Returns(_mockUserDbSet.Object);
		_mockDbContext.Setup(x => x.Set<Organization>())
			.Returns(_mockOrganizationDbSet.Object);

		_handler = new CreateAdminCommandHandler(_mockDbContext.Object, _dataProviderMock.Object, _mockOrganizationOptions.Object);
	}

	[Fact]
	public async Task Handle_ShouldAddAdmin_WhenNoAdminExists()
	{
		var userDbSet = new List<User> { }.BuildMockDbSet();
		var organizationDbSet = new List<Organization> { }.BuildMockDbSet();

		_mockDbContext.Setup(x => x.Set<User>()).Returns(userDbSet.Object);
		_mockDbContext.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
						.ReturnsAsync(Result.Success());

		_dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());

		var request = new CreateAdminCommand("newadmin@test.com", "New Admin", "Password123", "Password123", "Test Organization");

		var result = await _handler.Handle(request, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.True(result.Data.IsDone);

		organizationDbSet.Verify(m => m.Add(It.IsAny<Organization>()), Times.Once);
		userDbSet.Verify(m => m.Add(It.IsAny<User>()), Times.Once);
		_mockDbContext.Verify(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Handle_ShouldReturnFailure_WhenAdminAlreadyExists()
	{
		var existingUser = new User
		{
			Id = Guid.NewGuid(),
			Email = "existingadmin@test.com",
			FullName = "Existing Admin",
			Password = "hashedPassword",
			IsActive = true,
			Role = RoleTypes.Admin,
			CreatedAt = DateTime.UtcNow,
			PictureUrl = string.Empty,
			Status = UserStatus.CompleteSignUp,
			OrganizationId = Guid.NewGuid()
		};

		var userDbSet = new List<User> { existingUser }.BuildMockDbSet();
		_mockDbContext.Setup(x => x.Set<User>()).Returns(userDbSet.Object);

		var request = new CreateAdminCommand("existingadmin@test.com", "New Admin", "Password123", "Password123", "Test Organization");

		var result = await _handler.Handle(request, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Admin.AlreadyExists", result.Error.Code);
		Assert.Equal(AppResources.User.AlreadyExists, result.Error.Description);

		_mockDbContext.Verify(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Handle_ShouldReturnFailure_WhenSaveChangesFails()
	{
		var userDbSet = new List<User> { }.BuildMockDbSet();
		var organizationDbSet = new List<Organization> { }.BuildMockDbSet();

		_mockDbContext.Setup(x => x.Set<User>()).Returns(userDbSet.Object);
		_mockDbContext.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
						.ReturnsAsync(Result.Failure(Error.Failure("Database.Error", "Database operation failed")));

		_dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());

		var request = new CreateAdminCommand("newadmin@test.com", "New Admin", "Password123", "Password123", "Test Organization");

		var result = await _handler.Handle(request, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Admin.FailedToCreate", result.Error.Code);
		Assert.Equal(AppResources.System.FailedToAddAdmin, result.Error.Description);

		organizationDbSet.Verify(m => m.Add(It.IsAny<Organization>()), Times.Once);
		userDbSet.Verify(m => m.Add(It.IsAny<User>()), Times.Once);
		_mockDbContext.Verify(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Handle_ShouldCreateCorrectOrganization_WithProvidedDetails()
	{
		var userDbSet = new List<User> { }.BuildMockDbSet();
		var organizationDbSet = new List<Organization> { }.BuildMockDbSet();
		Organization capturedOrganization = null;

		_mockDbContext.Setup(x => x.Set<User>()).Returns(userDbSet.Object);
		_mockDbContext.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
						.ReturnsAsync(Result.Success());

		organizationDbSet.Setup(m => m.Add(It.IsAny<Organization>()))
			.Callback<Organization>(org => capturedOrganization = org);

		var organizationId = Guid.NewGuid();
		_dataProviderMock.Setup(x => x.NewGuid()).Returns(organizationId);

		var request = new CreateAdminCommand("admin@test.com", "Admin User", "Password123", "Password123", "My Organization");

		await _handler.Handle(request, CancellationToken.None);

		Assert.NotNull(capturedOrganization);
		Assert.Equal(organizationId, capturedOrganization.Id);
		Assert.Equal("My Organization", capturedOrganization.OrganizationName);
		Assert.Equal("My Organization_Bot", capturedOrganization.BotName);
		Assert.Equal("ltr", capturedOrganization.Direction);
		Assert.Equal("en-US", capturedOrganization.Language);
	}

	[Fact]
	public async Task Handle_ShouldCreateCorrectUser_WithProvidedDetails()
	{
		var userDbSet = new List<User> { }.BuildMockDbSet();
		var organizationDbSet = new List<Organization> { }.BuildMockDbSet();
		User capturedUser = null;

		_mockDbContext.Setup(x => x.Set<User>()).Returns(userDbSet.Object);
		_mockDbContext.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
						.ReturnsAsync(Result.Success());

		userDbSet.Setup(m => m.Add(It.IsAny<User>()))
			.Callback<User>(user => capturedUser = user);

		var organizationId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var now = DateTime.UtcNow;

		var guidSequence = new Queue<Guid>(new[] { organizationId, userId });
		_dataProviderMock.Setup(x => x.NewGuid()).Returns(() => guidSequence.Dequeue());
		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var request = new CreateAdminCommand("admin@test.com", "Admin User", "Password123", "Password123", "My Organization");

		await _handler.Handle(request, CancellationToken.None);

		Assert.NotNull(capturedUser);
		Assert.Equal(userId, capturedUser.Id);
		Assert.Equal("admin@test.com", capturedUser.Email);
		Assert.Equal("Admin User", capturedUser.FullName);
		Assert.Equal(HashHelper.HashPassword("Password123", userId), capturedUser.Password);
		Assert.True(capturedUser.IsActive);
		Assert.Equal(RoleTypes.Admin, capturedUser.Role);
		Assert.Equal(now, capturedUser.CreatedAt);
		Assert.Equal(string.Empty, capturedUser.PictureUrl);
		Assert.Equal(UserStatus.CompleteSignUp, capturedUser.Status);
		Assert.Equal(organizationId, capturedUser.OrganizationId);
	}
}
