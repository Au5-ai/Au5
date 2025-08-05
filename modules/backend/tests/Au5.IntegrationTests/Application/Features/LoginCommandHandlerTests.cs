using System.Net;
using Au5.Application.Features.Authentication;

namespace Au5.IntegrationTests.Application.Features;

public class LoginCommandHandlerTests : BaseIntegrationTest
{
	public LoginCommandHandlerTests(IntegrationTestWebApp factory)
		: base(factory)
	{
	}

	[Fact]
	public async Task Should_ReturnUser_WhenCredentialsAreValid()
	{
		var command = new LoginCommand("mha.karimi@gmail.com", "!qaz@wsx");
		var result = await Mediator.Send(command);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data?.AccessToken);
		Assert.NotEmpty(result.Data?.AccessToken);
		Assert.Equal(60000, result.Data?.ExpiresIn);
		Assert.Equal("Bearer", result.Data?.TokenType);
	}

	[Fact]
	public async Task Should_ReturnError_WhenCredentialsAreNotValid()
	{
		var command = new LoginCommand("mha.karimi@gmail.com", "InvalidPassword");
		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data?.AccessToken);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
	}
}
