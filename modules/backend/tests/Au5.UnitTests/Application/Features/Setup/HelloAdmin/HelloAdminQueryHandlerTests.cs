using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Setup.HelloAdmin;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Setup.HelloAdmin;
public class HelloAdminQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly HelloAdminQueryHandler _handler;

	public HelloAdminQueryHandlerTests()
	{
		_dbContextMock = new();
		_handler = new HelloAdminQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnTrue_When_AdminExistsAndIsActive()
	{
		var adminUser = new User { Role = RoleTypes.Admin, IsActive = true };
		var dbSet = new List<User> { adminUser }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new HelloAdminQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.Data.HelloFromAdmin);
	}

	[Fact]
	public async Task Should_ReturnFalse_When_NoActiveAdminExists()
	{
		var dbSet = new List<User>().BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new HelloAdminQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.Data.HelloFromAdmin);
	}

	[Fact]
	public async Task Should_ReturnFalse_When_AdminIsInactive()
	{
		var adminUser = new User { Role = RoleTypes.Admin, IsActive = false };
		var dbSet = new List<User> { adminUser }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		var query = new HelloAdminQuery();

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.Data.HelloFromAdmin);
	}
}
