using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Setup.AddAdmin;
using Au5.Domain.Entities;
using Au5.Shared;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Setup.AddAdmin;

public class AddAdminQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _mockDbContext;
	private readonly Mock<DbSet<User>> _mockUserDbSet;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly AddAdminQueryHandler _handler;

	public AddAdminQueryHandlerTests()
	{
		_mockDbContext = new Mock<IApplicationDbContext>();
		_mockUserDbSet = new Mock<DbSet<User>>();
		_dataProviderMock = new Mock<IDataProvider>();

		_mockDbContext.Setup(x => x.Set<User>())
			.Returns(_mockUserDbSet.Object);

		_handler = new AddAdminQueryHandler(_mockDbContext.Object, _dataProviderMock.Object);
	}

	[Fact]
	public async Task Handle_ShouldReturnUnauthorized_WhenAdminAlreadyExists()
	{
		var existingAdmin = new User
		{
			Id = Guid.NewGuid(),
			Email = "admin@test.com",
			FullName = "Admin User",
			IsActive = true,
			Role = RoleTypes.Admin
		};

		var users = new[] { existingAdmin }.BuildMockDbSet();

		_mockDbContext.Setup(x => x.Set<User>()).Returns(users.Object);
		var request = new AddAdminCommand("newadmin@test.com", "New Admin", "Password123", "Password123");

		var result = await _handler.Handle(request, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.Auth.UnAuthorizedAction, result.Error.Description);
	}

	[Fact]
	public async Task Handle_ShouldAddAdmin_WhenNoAdminExists()
	{
		var dbSet = new List<User> { }.BuildMockDbSet();

		_mockDbContext.Setup(x => x.Set<User>()).Returns(dbSet.Object);
		_mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
						.ReturnsAsync(Result.Success());

		var request = new AddAdminCommand("newadmin@test.com", "New Admin", "Password123", "Password123");

		var result = await _handler.Handle(request, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.True(result.Data.IsDone);

		dbSet.Verify(m => m.Add(It.IsAny<User>()), Times.Once);
		_mockDbContext.Verify(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}
}
