using System.Net;
using Au5.Application.Common;
using Au5.Application.Features.Authentication.AddAdmin;
using Au5.Domain.Common;
using Au5.Domain.Entities;

namespace Au5.IntegrationTests.Application.Features.Authentication;

public class AddAdminQueryHandlerTests : BaseIntegrationTest
{
	public AddAdminQueryHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Handle_Should_ReturnCorrectResponse_When_ThereIsNoAdmin()
	{
		var command = new AddAdminCommand("admin@gmail.com", "Mohammad Karimi", "!qa1z@wsX", "!qa1z@wsX");
		var result = await Mediator.Send(command);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data?.IsDone);

		var user = DbContext.Set<User>().FirstOrDefault(u => u.Email == command.Email && u.Role == RoleTypes.Admin);
		Assert.NotNull(user);
		Assert.Null(user.LastLoginAt);
		Assert.Equal(command.FullName, user.FullName);
		Assert.Equal(RoleTypes.Admin, user.Role);
		Assert.True(user.IsActive);
		Assert.Equal(Constants.DefaultPictureUrl, user.PictureUrl);
		Assert.NotEqual(Guid.Empty, user.Id);
	}

	[Fact]
	public async Task Handle_Should_ReturnUnauthorized_When_ThereIsAdmin()
	{
		DbContext.Set<User>().Add(new User
		{
			Id = Guid.NewGuid(),
			FullName = "Test",
			Password = "HashedPassword",
			Email = "admin0@gmail.com",
			Role = RoleTypes.Admin,
			CreatedAt = DateTime.Now,
			PictureUrl = "DefaultPictureUrl",
			IsActive = true
		});
		await DbContext.SaveChangesAsync();

		var command = new AddAdminCommand("admin@gmail.com", "Mohammad Karimi", "!qa1z@wsX", "!qa1z@wsX");
		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.Unauthorized, result.Error.Type);

		var user = DbContext.Set<User>().FirstOrDefault(u => u.Email == command.Email && u.Role == RoleTypes.Admin);
		Assert.Null(user);
	}
}
