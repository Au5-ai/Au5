using Au5.Application.Common.Options;
using Au5.Application.Features.Admin.Create;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Setup.AddAdmin;

public class AddAdminQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _mockDbContext;
	private readonly Mock<DbSet<User>> _mockUserDbSet;
	private readonly Mock<DbSet<Organization>> _mockOrganizationDbSet;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _mockOrganizationOptions;
	private readonly CreateAdminCommandHandler _handler;

	public AddAdminQueryHandlerTests()
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
}
