using System.Net;
using Au5.Domain.Entities;

namespace Au5.UnitTests.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;

public class RemoveMeetingFromSpaceCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnSuccessResponse_When_MeetingSpaceExists()
	{
		var fixture = new RemoveMeetingFromSpaceCommandHandlerTestFixture()
			.WithExistingMeetingSpace()
			.WithSuccessfulSave();

		var command = fixture.CreateCommand();

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.True(result.Data.Success);
		Assert.Equal(AppResources.MeetingSpace.RemovedSuccessfully, result.Data.Message);

		fixture.MockDbContext.Verify(db => db.Set<MeetingSpace>().Remove(It.IsAny<MeetingSpace>()), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingSpaceDoesNotExist()
	{
		var fixture = new RemoveMeetingFromSpaceCommandHandlerTestFixture()
			.WithNoMeetingSpace();

		var command = fixture.CreateCommand(Guid.NewGuid(), Guid.NewGuid());

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.NotFound, result.Error.Type);
		Assert.Equal(AppResources.MeetingSpace.MeetingNotInSpace, result.Error.Description);
	}
}
