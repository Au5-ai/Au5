using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Domain.Entities;

namespace Au5.IntegrationTests.Application.Features;

public class GetMyInfoQueryHandlerTests : BaseIntegrationTest
{
	public GetMyInfoQueryHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Handle_Should_ReturnParticipant_When_UserExists()
	{
		TestCurrentUserService.IsAuthenticated = true;
		TestCurrentUserService.UserId = UserId;

		DbContext.Set<User>().Add(new User()
		{
			Email = "mha.karimi@gmail.com",
			IsActive = true,
			FullName = "Mohammad Karimi",
			Id = UserId,
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA="
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var query = new GetMyInfoQuery();

		var result = await Mediator.Send(query);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(UserId, result.Data.Id);
		Assert.Equal("Mohammad Karimi", result.Data.FullName);
		Assert.Equal("https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo", result.Data.PictureUrl);
	}

	[Fact]
	public async Task Handle_Should_ReturnUnauthorize_When_UserNotExists()
	{
		var differentUserId = Guid.NewGuid();
		TestCurrentUserService.IsAuthenticated = true;
		TestCurrentUserService.UserId = differentUserId;

		DbContext.Set<User>().Add(new User()
		{
			Email = "mha.karimi@gmail.com",
			IsActive = true,
			FullName = "Mohammad Karimi",
			Id = UserId,
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

		TestCurrentUserService.IsAuthenticated = true;
		TestCurrentUserService.UserId = userId;

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
