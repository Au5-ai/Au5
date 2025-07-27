using System.Net;
using Au5.Application.Features.Authentication;

namespace Au5.UnitTests.Application.Features.Authentication;

public class AuthenticationHandlerTests
{
	[Fact]
	public async Task Should_ReturnToken_When_ValidUser()
	{
		var fixture = new AuthenticationTestFixture()
						.WithValidUser()
						.WithToken("test-token");

		var result = await fixture.BuildHandler()
			.Handle(new LoginRequest(fixture.TestUser.Email, "secret"), CancellationToken.None);

		Assert.Equal("test-token", result.Data.AccessToken);
	}

	[Fact]
	public async Task Should_ReturnUnauthorized_When_PasswordIncorrect()
	{
		var fixture = new AuthenticationTestFixture()
						.WithValidUser("correct-password")
						.WithToken();

		var result = await fixture.BuildHandler()
			.Handle(new LoginRequest(fixture.TestUser.Email, "wrong-password"), CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
	}

	[Fact]
	public async Task Should_ReturnUnauthorized_When_UserDoesNotExist()
	{
		var fixture = new AuthenticationTestFixture()
						.WithValidUser()
						.WithToken();

		var result = await fixture.BuildHandler()
			.Handle(new LoginRequest("nonexistent@example.com", "any"), CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Username or password is incorrect.", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnUnauthorized_When_UserIsNotActive()
	{
		var fixture = new AuthenticationTestFixture()
						.WithNoActiveUsers()
						.WithToken();

		var result = await fixture.BuildHandler()
			.Handle(new LoginRequest("test@example.com", "secret"), CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Username or password is incorrect.", result.Error.Description);
	}
}
