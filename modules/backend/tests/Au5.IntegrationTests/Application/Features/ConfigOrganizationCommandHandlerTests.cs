using Au5.Application.Features.Org.Config;
using Au5.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Au5.IntegrationTests.Application.Features;

public class ConfigOrganizationCommandHandlerTests : BaseIntegrationTest
{
	public ConfigOrganizationCommandHandlerTests(IntegrationTestWebApp factory)
		: base(factory)
	{
	}

	[Fact]
	public async Task Should_AddConfig_When_ThereIsNoConfigAsync()
	{
		var command = new ConfigOrganizationCommand()
		{
			BotName = "TestBot",
			Direction = "ltr",
			HubUrl = "https://example.com/hub",
			Language = "fa-IR",
			Name = "Test Organization",
			PanelUrl = "https://example.com/panel",
			ServiceBaseUrl = "https://example.com/api",
			OpenAIToken = "sk-test-token",
			ForceUpdate = false
		};

		_ = await Mediator.Send(command);

		var config = await DbContext.Set<Organization>().FirstOrDefaultAsync();
		Assert.NotNull(config);
		Assert.Equal("TestBot", config.BotName);
		Assert.Equal("ltr", config.Direction);
		Assert.Equal("https://example.com/hub", config.HubUrl);
		Assert.Equal("fa-IR", config.Language);
		Assert.Equal("Test Organization", config.Name);
		Assert.Equal("https://example.com/panel", config.PanelUrl);
		Assert.Equal("https://example.com/api", config.ServiceBaseUrl);
		Assert.Equal("sk-test-token", config.OpenAIToken);
	}

	[Fact]
	public async Task Should_Update_Organization_When_ConfigExistsAnd_ForceUpdate_IsTrue()
	{
		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			HubUrl = "https://example.com/hub",
			Language = "fa-IR",
			Name = "Test Organization",
			PanelUrl = "https://example.com/panel",
			ServiceBaseUrl = "https://example.com/api",
			OpenAIToken = "sk-test-token",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var command = new ConfigOrganizationCommand
		{
			Name = "NewOrg",
			BotName = "NewBot",
			HubUrl = "https://newhub.com",
			Direction = "rtl",
			Language = "en-EN",
			ServiceBaseUrl = "https://new.service",
			PanelUrl = "https://new.panel",
			OpenAIToken = "new-token",
			ForceUpdate = true
		};

		_ = await Mediator.Send(command);

		var config = await DbContext.Set<Organization>().FirstOrDefaultAsync();
		Assert.NotNull(config);
		Assert.True(config.Id != Guid.Empty);
		Assert.Equal("NewBot", config.BotName);
		Assert.Equal("rtl", config.Direction);
		Assert.Equal("https://newhub.com", config.HubUrl);
		Assert.Equal("en-EN", config.Language);
		Assert.Equal("NewOrg", config.Name);
		Assert.Equal("https://new.panel", config.PanelUrl);
		Assert.Equal("https://new.service", config.ServiceBaseUrl);
		Assert.Equal("new-token", config.OpenAIToken);
	}

	[Fact]
	public async Task Should_Fail_When_OrganizationExists_And_ForceUpdate_IsFalse()
	{
		DbContext.Set<Organization>().Add(new Organization
		{
			Id = Guid.NewGuid(),
			BotName = "TestBot",
			Direction = "ltr",
			HubUrl = "https://example.com/hub",
			Language = "fa-IR",
			Name = "Test Organization",
			PanelUrl = "https://example.com/panel",
			ServiceBaseUrl = "https://example.com/api",
			OpenAIToken = "sk-test-token",
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);

		var command = new ConfigOrganizationCommand
		{
			Name = "NewOrg",
			BotName = "NewBot",
			HubUrl = "https://newhub.com",
			Direction = "rtl",
			Language = "en-EN",
			ServiceBaseUrl = "https://new.service",
			PanelUrl = "https://new.panel",
			OpenAIToken = "new-token",
			ForceUpdate = false
		};

		var result = await Mediator.Send(command);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.ConfigAlreadyExist, result.Error.Description);
	}

	[Fact]
	public async Task Should_ValidationError_When_OrganizationIsNotCorrect()
	{
		var invalidCommand = new ConfigOrganizationCommand
		{
			Name = "NewOrg",
			BotName = "NewBot",
			HubUrl = "https://newhub.com",
			Direction = "rtl",
			Language = "fa",
			ServiceBaseUrl = "https://new.service",
			PanelUrl = "https://new.panel",
			OpenAIToken = "new-token",
			ForceUpdate = true
		};

		await Assert.ThrowsAsync<ValidationException>(async () => await Mediator.Send(invalidCommand));
	}
}
