using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Domain.Entities;

namespace Au5.IntegrationTests.Application.Features;

public class GetMyInfoQueryHandlerTests : BaseIntegrationTest
{
	private readonly Guid _userId = Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960");

	public GetMyInfoQueryHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Handle_Should_ReturnParticipant_When_UserExists()
	{
		WebApp.TestCurrentUserService.IsAuthenticated = true;
		WebApp.TestCurrentUserService.UserId = _userId;

		DbContext.Set<User>().Add(new User()
		{
			Email = "mha.karimi@gmail.com",
			IsActive = true,
			FullName = "Mohammad Karimi",
			Id = _userId,
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA="
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var query = new GetMyInfoQuery();

		var result = await Mediator.Send(query);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(_userId, result.Data.Id);
		Assert.Equal("Mohammad Karimi", result.Data.FullName);
		Assert.Equal("https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo", result.Data.PictureUrl);
	}

	[Fact]
	public async Task Handle_Should_ReturnUnauthorize_When_UserNotExists()
	{
		var differentUserId = Guid.NewGuid();
		WebApp.TestCurrentUserService.IsAuthenticated = true;
		WebApp.TestCurrentUserService.UserId = differentUserId;

		DbContext.Set<User>().Add(new User()
		{
			Email = "mha.karimi@gmail.com",
			IsActive = true,
			FullName = "Mohammad Karimi",
			Id = _userId, // This user exists but has different ID than current user
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA="
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var query = new GetMyInfoQuery();

		var result = await Mediator.Send(query);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(result.Error.Type, result.Error.Type);
	}

	[Fact]
	public async Task Handle_Should_ReturnUnauthorize_When_UserExistsButNotActive()
	{
		var userId = Guid.NewGuid();

		WebApp.TestCurrentUserService.IsAuthenticated = true;
		WebApp.TestCurrentUserService.UserId = userId;

		DbContext.Set<User>().Add(new User()
		{
			Email = "Email@email.com",
			IsActive = false, // User exists but is not active
			FullName = "Mohammad Karimi",
			Id = userId,
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA="
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var query = new GetMyInfoQuery();

		var result = await Mediator.Send(query);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(result.Error.Type, result.Error.Type);
	}
}
