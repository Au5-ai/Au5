using Au5.Application.Features.Assistants.GetAll;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Assistants;
public class GetAssistantsQueryHandlerTests
{
	[Fact]
	public async Task Should_ReturnAllAssistants_When_Exist()
	{
		var assistants = new List<Assistant>
		{
			new() { Id = Guid.NewGuid(), Name = "A1", IsActive = true },
			new() { Id = Guid.NewGuid(), Name = "A2", IsActive = true },
			new() { Id = Guid.NewGuid(), Name = "A3", IsActive = false },
			new() { Id = Guid.NewGuid(), Name = "A4", IsActive = true, IsDefault = true }
		};
		var dbSetMock = assistants.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(x => x.Set<Assistant>()).Returns(dbSetMock.Object);

		var handler = new GetAssistantsQueryHandler(dbContextMock.Object);
		var result = await handler.Handle(new GetAssistantsQuery(), CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(2, result.Data.Count);
		Assert.Contains(result.Data, x => x.Name == "A1");
		Assert.Contains(result.Data, x => x.Name == "A2");
	}
}
