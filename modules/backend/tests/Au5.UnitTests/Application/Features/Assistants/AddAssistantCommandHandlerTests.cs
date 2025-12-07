using Au5.Application.Common.Options;
using Au5.Application.Dtos.AI;
using Au5.Application.Features.Assistants.AddAssistant;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Assistants;

public class AddAssistantCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnId_When_ValidRequest()
	{
		List<Organization> config = [new Organization()];
		var configDbSetMock = config.BuildMockDbSet();
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		var organizationOptions = new OrganizationOptions
		{
			OpenAIToken = "test-token",
			OpenAIProxyUrl = "https://proxy.com"
		};

		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());

		var id = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		var now = DateTime.UtcNow;
		dataProviderMock.Setup(x => x.NewGuid()).Returns(id);
		dataProviderMock.Setup(x => x.UtcNow).Returns(now);
		currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(id, result.Data.Id);
		dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		List<Organization> config = [new Organization()];
		var configDbSetMock = config.BuildMockDbSet();
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		var organizationOptions = new OrganizationOptions
		{
			OpenAIToken = "test-token",
			OpenAIProxyUrl = "https://proxy.com"
		};

		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Failure(Error.Failure(description: "fail")));

		currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(Guid.NewGuid());
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);
		dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());
		dataProviderMock.Setup(x => x.UtcNow).Returns(DateTime.UtcNow);

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.DatabaseFailureMessage, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_OpenAIConnectionFailed()
	{
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		List<Organization> config = [new Organization() { }];
		var configDbSetMock = config.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(Guid.NewGuid());
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);
		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync(string.Empty);
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.Assistant.OpenAIConnectionFailed, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_ConfigNotFound()
	{
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		List<Organization> config = [];
		var configDbSetMock = config.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync(string.Empty);
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		var handler = new AddAssistantCommandHandler(
			dbContextMock.Object,
			aiEngineMock.Object,
			currentUserServiceMock.Object,
			dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.Organization.IsNotConfigured, result.Error.Description);
	}

	[Fact]
	public async Task Should_SetIsDefaultTrue_When_UserIsAdmin()
	{
		List<Organization> config = [new Organization()];
		var configDbSetMock = config.BuildMockDbSet();
		var assistantsList = new List<Assistant>();
		var dbSetMock = assistantsList.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());

		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());
		dataProviderMock.Setup(x => x.UtcNow).Returns(DateTime.UtcNow);
		currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		dbSetMock.Verify(x => x.Add(It.Is<Assistant>(a => a.IsDefault)), Times.Once);
	}

	[Fact]
	public async Task Should_SetIsDefaultFalse_When_UserIsNotAdmin()
	{
		List<Organization> config = [new Organization()];
		var configDbSetMock = config.BuildMockDbSet();
		var assistantsList = new List<Assistant>();
		var dbSetMock = assistantsList.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());

		var userId = Guid.NewGuid();
		var organizationId = Guid.NewGuid();
		dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());
		dataProviderMock.Setup(x => x.UtcNow).Returns(DateTime.UtcNow);
		currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(organizationId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.User);

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "prompt",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		dbSetMock.Verify(x => x.Add(It.Is<Assistant>(a => !a.IsDefault)), Times.Once);
	}

	[Fact]
	public async Task Should_PassCorrectDataToAIEngine_When_CreatingAssistant()
	{
		List<Organization> config = [new Organization()];
		var configDbSetMock = config.BuildMockDbSet();
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("assistant-id");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());

		currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(Guid.NewGuid());
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);
		dataProviderMock.Setup(x => x.NewGuid()).Returns(Guid.NewGuid());
		dataProviderMock.Setup(x => x.UtcNow).Returns(DateTime.UtcNow);

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "test instructions",
			LLMModel = "gpt-4-turbo"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		aiEngineMock.Verify(
			x => x.CreateAssistantAsync(
				It.Is<CreateAssistantRequest>(req =>
					req.Name == "Test Assistant" &&
					req.Instructions == "test instructions" &&
					req.Model == "gpt-4-turbo"),
				It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_PopulateAllEntityProperties_When_CreatingAssistant()
	{
		List<Organization> config = [new Organization()];
		var configDbSetMock = config.BuildMockDbSet();
		var assistantsList = new List<Assistant>();
		var dbSetMock = assistantsList.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		var aiEngineMock = new Mock<IAIClient>();
		var currentUserServiceMock = new Mock<ICurrentUserService>();
		var dataProviderMock = new Mock<IDataProvider>();

		aiEngineMock.Setup(x => x.CreateAssistantAsync(It.IsAny<CreateAssistantRequest>(), It.IsAny<CancellationToken>())).ReturnsAsync("openai-asst-123");
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.Set<Organization>()).Returns(configDbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());

		var expectedId = Guid.NewGuid();
		var expectedUserId = Guid.NewGuid();
		var expectedOrgId = Guid.NewGuid();
		var expectedTime = DateTime.UtcNow;
		dataProviderMock.Setup(x => x.NewGuid()).Returns(expectedId);
		dataProviderMock.Setup(x => x.UtcNow).Returns(expectedTime);
		currentUserServiceMock.Setup(x => x.UserId).Returns(expectedUserId);
		currentUserServiceMock.Setup(x => x.OrganizationId).Returns(expectedOrgId);
		currentUserServiceMock.Setup(x => x.Role).Returns(RoleTypes.Admin);

		var handler = new AddAssistantCommandHandler(dbContextMock.Object, aiEngineMock.Object, currentUserServiceMock.Object, dataProviderMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "My Assistant",
			Icon = "assistant-icon.png",
			Description = "My Description",
			Instructions = "My Instructions",
			LLMModel = "gpt-4"
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		dbSetMock.Verify(
			x => x.Add(
				It.Is<Assistant>(a =>
					a.Id == expectedId &&
					a.Name == "My Assistant" &&
					a.Icon == "assistant-icon.png" &&
					a.Description == "My Description" &&
					a.Instructions == "My Instructions" &&
					a.LLMModel == "gpt-4" &&
					a.IsActive &&
					a.UserId == expectedUserId &&
					a.OrganizationId == expectedOrgId &&
					a.CreatedAt == expectedTime &&
					a.OpenAIAssistantId == "openai-asst-123")),
			Times.Once);
	}
}
