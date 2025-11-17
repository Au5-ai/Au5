using Au5.Application.Features.Organizations.SetConfig;
using Au5.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Au5.IntegrationTests.Application.Features;

public class OrganizationCommandHandlerTests : BaseIntegrationTest
{
	public OrganizationCommandHandlerTests(IntegrationTestWebApp factory)
		: base(factory)
	{
	}

	[Fact]
	public async Task Should_AddConfig_When_ThereIsNoConfigAsync()
	{
		var command = new OrganizationCommand()
		{
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		};

		_ = await Mediator.Send(command);

		var config = await DbContext.Set<Organization>().FirstOrDefaultAsync();
		Assert.NotNull(config);
		Assert.Equal("TestBot", config.BotName);
		Assert.Equal("ltr", config.Direction);
		Assert.Equal("fa-IR", config.Language);
		Assert.Equal("Test Organization", config.OrganizationName);
	}

	[Fact]
	public async Task Should_Update_Organization_When_ConfigExistsAnd_ForceUpdate_IsTrue()
	{
		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			Language = "fa-IR",
			OrganizationName = "Test Organization",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var command = new OrganizationCommand
		{
			OrganizationName = "NewOrg",
			BotName = "NewBot",
			Direction = "rtl",
			Language = "en-EN",
		};

		_ = await Mediator.Send(command);

		var config = await DbContext.Set<Organization>().FirstOrDefaultAsync();
		Assert.NotNull(config);
		Assert.True(config.Id != Guid.Empty);
		Assert.Equal("NewBot", config.BotName);
		Assert.Equal("rtl", config.Direction);
		Assert.Equal("en-EN", config.Language);
		Assert.Equal("NewOrg", config.OrganizationName);
	}

	[Fact]
	public async Task Should_ValidationError_When_OrganizationIsNotCorrect()
	{
		var invalidCommand = new OrganizationCommand
		{
			OrganizationName = "NewOrg",
			BotName = "NewBot",
			Direction = "rtl",
			Language = "fa",
		};

		await Assert.ThrowsAsync<ValidationException>(async () => await Mediator.Send(invalidCommand));
	}
}
