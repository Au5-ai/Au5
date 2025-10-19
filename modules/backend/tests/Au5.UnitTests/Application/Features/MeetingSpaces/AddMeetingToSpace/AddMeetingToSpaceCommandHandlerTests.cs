using System.Net;
using Au5.Domain.Entities;

namespace Au5.UnitTests.Application.Features.MeetingSpaces.AddMeetingToSpace;

public class AddMeetingToSpaceCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnSuccessResponse_When_ValidMeetingAndSpace()
	{
		var fixture = new AddMeetingToSpaceCommandHandlerTestFixture()
			.WithValidMeeting()
			.WithValidSpace()
			.WithNoExistingMeetingSpace()
			.WithCurrentUser()
			.WithSuccessfulSave();

		var command = fixture.CreateCommand();

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.True(result.Data.Success);
		Assert.Equal(AppResources.MeetingSpace.AddedSuccessfully, result.Data.Message);

		fixture.MockDbContext.Verify(db => db.Set<MeetingSpace>().Add(It.IsAny<MeetingSpace>()), Times.Once);
		fixture.MockDbContext.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingDoesNotExist()
	{
		var fixture = new AddMeetingToSpaceCommandHandlerTestFixture()
			.WithNoMeeting()
			.WithValidSpace()
			.WithCurrentUser();

		var command = fixture.CreateCommand(Guid.NewGuid(), fixture.TestSpace?.Id ?? Guid.NewGuid());

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.NotFound, result.Error.Type);
		Assert.Equal(AppResources.MeetingSpace.MeetingNotFound, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceDoesNotExist()
	{
		var fixture = new AddMeetingToSpaceCommandHandlerTestFixture()
			.WithValidMeeting()
			.WithNoSpace()
			.WithCurrentUser();

		var command = fixture.CreateCommand(fixture.TestMeeting?.Id ?? Guid.NewGuid(), Guid.NewGuid());

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.NotFound, result.Error.Type);
		Assert.Equal(AppResources.MeetingSpace.SpaceNotFound, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_SpaceIsInactive()
	{
		var fixture = new AddMeetingToSpaceCommandHandlerTestFixture()
			.WithValidMeeting()
			.WithInactiveSpace()
			.WithCurrentUser();

		var command = fixture.CreateCommand();

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.NotFound, result.Error.Type);
		Assert.Equal(AppResources.MeetingSpace.SpaceNotFound, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingAlreadyInSpace()
	{
		var fixture = new AddMeetingToSpaceCommandHandlerTestFixture()
			.WithValidMeeting()
			.WithValidSpace()
			.WithExistingMeetingSpace()
			.WithCurrentUser();

		var command = fixture.CreateCommand();

		var result = await fixture.BuildHandler().Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Equal(AppResources.MeetingSpace.MeetingAlreadyInSpace, result.Error.Description);
	}
}
