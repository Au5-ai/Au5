using System.Net;
using Au5.Application.Features.Authentication.Login;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.Shared;

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
		Assert.NotNull(result.Data?.RefreshToken);
		Assert.Equal(60000, result.Data?.ExpiresIn); // 15 minutes in seconds
		Assert.Equal(2592000, result.Data?.RefreshTokenExpiresIn); // 30 days in seconds
		Assert.Equal("Bearer", result.Data?.TokenType);

		var user = DbContext.Set<User>().FirstOrDefault(u => u.Email == command.Username);
		Assert.NotNull(user);
		Assert.NotNull(user.LastLoginAt);
		Assert.NotNull(user.RefreshToken);
		Assert.NotNull(user.RefreshTokenExpiry);
	}

	[Fact]
	public async Task Should_ReturnError_WhenCredentialsAreNotValid()
	{
		var command = new LoginCommand("mha.karimi@gmail.com", "InvalidPassword");
		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
	}

	[Fact]
	public async Task Should_ReturnError_WhenUserDoesNotExist()
	{
		var command = new LoginCommand("nonexistent@example.com", "!qaz@wsx");
		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
	}

	[Fact]
	public async Task Should_ReturnError_WhenUserIsInactive()
	{
		// First, create an inactive user
		var inactiveUser = new User
		{
			Id = Guid.NewGuid(),
			Email = "inactive@example.com",
			FullName = "Inactive User",
			Password = HashHelper.HashPassword("!qaz@wsx", Guid.NewGuid()),
			IsActive = false,
			CreatedAt = DateTime.UtcNow,
			Role = RoleTypes.User,
			Status = UserStatus.CompleteSignUp
		};

		DbContext.Set<User>().Add(inactiveUser);
		await DbContext.SaveChangesAsync();

		var command = new LoginCommand("inactive@example.com", "!qaz@wsx");
		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);
	}

	[Fact]
	public async Task Should_SetRefreshToken_WhenLoginIsSuccessful()
	{
		var command = new LoginCommand("mha.karimi@gmail.com", "!qaz@wsx");
		var result = await Mediator.Send(command);

		Assert.True(result.IsSuccess);

		var user = DbContext.Set<User>().FirstOrDefault(u => u.Email == command.Username);
		Assert.NotNull(user);
		Assert.Equal(result.Data?.RefreshToken, user.RefreshToken);
		Assert.True(user.RefreshTokenExpiry > DateTime.UtcNow);
	}

	[Fact]
	public async Task Should_UpdateLastLoginAt_WhenLoginIsSuccessful()
	{
		var command = new LoginCommand("mha.karimi@gmail.com", "!qaz@wsx");
		var beforeLogin = DateTime.UtcNow;

		var result = await Mediator.Send(command);

		Assert.True(result.IsSuccess);

		var user = DbContext.Set<User>().FirstOrDefault(u => u.Email == command.Username);
		Assert.NotNull(user);
		Assert.NotNull(user.LastLoginAt);
		Assert.True(user.LastLoginAt >= beforeLogin);
	}
}
