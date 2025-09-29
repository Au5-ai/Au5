using Au5.Application.Features.Assistants.AddAssistant;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Assistants;
public class AddAssistantCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnId_When_ValidRequest()
	{
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Au5.Shared.Result.Success());

		var handler = new AddAssistantCommandHandler(dbContextMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Prompt = "prompt",
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotEqual(Guid.Empty, result.Data.Id);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var dbSetMock = new List<Assistant>().BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);
		dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Au5.Shared.Result.Failure(Au5.Shared.Error.Failure(description: "fail")));

		var handler = new AddAssistantCommandHandler(dbContextMock.Object);
		var command = new AddAssistantCommand
		{
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "desc",
			Prompt = "prompt",
		};

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal(AppResources.DatabaseFailureMessage, result.Error.Description);
	}
}
