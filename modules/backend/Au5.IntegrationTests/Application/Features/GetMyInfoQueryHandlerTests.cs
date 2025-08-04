using Au5.Application.Features.UserManagement.GetMyInfo;
using Au5.Domain.Entities;

namespace Au5.IntegrationTests.Application.Features;

public class GetMyInfoQueryHandlerTests : BaseIntegrationTest
{
	private readonly Guid _userId = Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960");

	public GetMyInfoQueryHandlerTests(IntegrationTestWebApp factory)
		: base(factory)
	{
	}

	[Fact]
	public async Task Handle_Should_ReturnParticipant_When_UserExists()
	{
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

		var query = new GetMyInfoQuery(_userId);

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

		var query = new GetMyInfoQuery(Guid.NewGuid());

		var result = await Mediator.Send(query);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(result.Error.Type, result.Error.Type);
	}

	[Fact]
	public async Task Handle_Should_ReturnUnauthorize_When_UserExistsButNotActive()
	{
		DbContext.Set<User>().Add(new User()
		{
			Email = "mha.karimi@gmail.com",
			IsActive = false,
			FullName = "Mohammad Karimi",
			Id = _userId,
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Password = "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA="
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var query = new GetMyInfoQuery(_userId);

		var result = await Mediator.Send(query);

		Assert.False(result.IsSuccess);
		Assert.Null(result.Data);
		Assert.Equal(result.Error.Type, result.Error.Type);
	}
}
