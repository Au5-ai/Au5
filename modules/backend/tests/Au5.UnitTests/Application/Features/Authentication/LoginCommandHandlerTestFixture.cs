using Au5.Application.Features.Authentication.Login;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Authentication;

public class LoginCommandHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ITokenService> MockTokenService { get; } = new();

	public LoginCommandHandler Handler { get; private set; }

	public User TestUser { get; private set; }

	public LoginCommandHandlerTestFixture WithValidUser(string password = "secret")
	{
		var userId = Guid.NewGuid();
		TestUser = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Password = HashHelper.HashPassword(password, userId),
			IsActive = true,
		};

		var dbSet = new List<User> { TestUser }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		return this;
	}

	public LoginCommandHandlerTestFixture WithNoActiveUsers(string password = "secret")
	{
		var userId = Guid.NewGuid();
		TestUser = new User
		{
			Id = userId,
			Email = "test@example.com",
			FullName = "Test User",
			Password = HashHelper.HashPassword(password, userId),
			IsActive = false,
		};

		var dbSet = new List<User> { TestUser }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		return this;
	}

	public LoginCommandHandlerTestFixture WithToken(string token = "fake-token")
	{
		MockTokenService.Setup(ts => ts.GenerateToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<RoleTypes>(), It.IsAny<Guid>()))
						.Returns(new TokenResponse(token, 3600, string.Empty, "Bearer"));
		return this;
	}

	public LoginCommandHandler BuildHandler()
	{
		var dataProviderMock = new Mock<IDataProvider>();
		Handler = new LoginCommandHandler(MockDbContext.Object, MockTokenService.Object, dataProviderMock.Object);
		return Handler;
	}
}
