using Au5.Application.Features.Meetings.RemoveMeeting;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.RemoveMeeting;

public class RemoveMeetingCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly RemoveMeetingCommandHandler _handler;

	public RemoveMeetingCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();

		_handler = new RemoveMeetingCommandHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_MeetingExistsAndIsRemoved()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Ended);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data.IsRemoved);
		Assert.Equal(MeetingStatus.Deleted, meeting.Status);
	}

	[Fact]
	public async Task Should_SetStatusToDeleted_When_MeetingIsRemoved()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Ended);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal(MeetingStatus.Deleted, meeting.Status);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_RemoveArchivedMeeting_When_MeetingStatusIsArchived()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Archived);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data.IsRemoved);
		Assert.Equal(MeetingStatus.Deleted, meeting.Status);
	}

	[Fact]
	public async Task Should_RemoveActiveMeeting_When_MeetingStatusIsActive()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Recording);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data.IsRemoved);
		Assert.Equal(MeetingStatus.Deleted, meeting.Status);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingDoesNotExist()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meetings = new List<Meeting>();
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingIdIsInvalid()
	{
		var command = new RemoveMeetingCommand(Guid.NewGuid());

		var meeting = CreateMeeting(Guid.NewGuid(), MeetingStatus.Ended);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_DatabaseSaveFails()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Ended);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Error.Failure("Database", "Save failed"));

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.RemoveFailed", result.Error.Code);
	}

	[Fact]
	public async Task Should_NotModifyOtherMeetings_When_RemovingSpecificMeeting()
	{
		var meetingId = Guid.NewGuid();
		var otherMeetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Ended);
		var otherMeeting = CreateMeeting(otherMeetingId, MeetingStatus.Ended);

		var meetings = new List<Meeting> { meeting, otherMeeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal(MeetingStatus.Deleted, meeting.Status);
		Assert.Equal(MeetingStatus.Ended, otherMeeting.Status);
	}

	[Fact]
	public async Task Should_CallSaveChangesOnce_When_MeetingIsRemoved()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meeting = CreateMeeting(meetingId, MeetingStatus.Ended);

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		await _handler.Handle(command, CancellationToken.None);

		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_NotCallSaveChanges_When_MeetingDoesNotExist()
	{
		var meetingId = Guid.NewGuid();
		var command = new RemoveMeetingCommand(meetingId);

		var meetings = new List<Meeting>();
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		await _handler.Handle(command, CancellationToken.None);

		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	private static Meeting CreateMeeting(Guid meetingId, MeetingStatus status)
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		return new Meeting
		{
			Id = meetingId,
			MeetId = $"meet-{meetingId}",
			MeetName = "Test Meeting",
			Platform = "GoogleMeet",
			BotName = "TestBot",
			IsBotAdded = true,
			CreatedAt = now,
			ClosedAt = status is MeetingStatus.Ended or MeetingStatus.Archived or MeetingStatus.Deleted ? now : default,
			Duration = status is MeetingStatus.Ended or MeetingStatus.Archived ? "30m" : null,
			Status = status,
			IsFavorite = false,
			Participants = [],
			Guests = [],
			Entries = []
		};
	}
}
