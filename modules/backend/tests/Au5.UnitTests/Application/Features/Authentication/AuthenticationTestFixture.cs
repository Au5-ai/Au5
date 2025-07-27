using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Authentication;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Authentication;

public class AuthenticationTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ITokenService> MockTokenService { get; } = new();

	public AuthenticationHandler Handler { get; private set; }

	public User TestUser { get; private set; }

	public AuthenticationTestFixture WithValidUser(string password = "secret")
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

		var dbSet = new List<User> { TestUser }.AsQueryable().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		return this;
	}

	public AuthenticationTestFixture WithNoActiveUsers(string password = "secret")
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

		var dbSet = new List<User> { TestUser }.AsQueryable().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<User>()).Returns(dbSet.Object);

		return this;
	}

	public AuthenticationTestFixture WithToken(string token = "fake-token")
	{
		MockTokenService.Setup(ts => ts.GenerateToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()))
						.Returns(token);

		return this;
	}

	public AuthenticationHandler BuildHandler()
	{
		Handler = new AuthenticationHandler(MockDbContext.Object, MockTokenService.Object);
		return Handler;
	}
}
