using Au5.Application.Features.Meetings.ToggleArchive;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.ToggleArchive;

public class ToggleArchiveCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly ToggleArchiveCommandHandler _handler;

	public ToggleArchiveCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();

		_handler = new ToggleArchiveCommandHandler(
			_dbContextMock.Object,
			_currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_MeetingExistsAndUserIsParticipant()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, MeetingStatus.Ended);
		meeting.Participants =
		[
			new() { UserId = userId }
		];

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data.IsArchived);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingDoesNotExist()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var command = new ToggleArchiveCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meetings = new List<Meeting>();
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingExistsButMeetIdDoesNotMatch()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var command = new ToggleArchiveCommand(Guid.NewGuid());

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, "different-meet-id", MeetingStatus.Ended);
		meeting.Participants =
		[
			new() { UserId = userId }
		];

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnForbidden_When_UserIsNotParticipant()
	{
		var userId = Guid.NewGuid();
		var otherUserId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, MeetingStatus.Ended);
		meeting.Participants =
		[
			new() { UserId = otherUserId }
		];

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotParticipant", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_TryingToArchiveActiveMeeting()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, MeetingStatus.Recording);
		meeting.Participants =
		[
			new() { UserId = userId }
		];

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.AlreadyActive", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_DatabaseSaveFails()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, MeetingStatus.Ended);
		meeting.Participants =
		[
			new() { UserId = userId }
		];

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Error.Failure("Database", "Save failed"));

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.FailedToUpdate", result.Error.Code);
	}

	private static Meeting CreateMeeting(Guid meetingId, string meetId, MeetingStatus status)
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		return new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			MeetName = "Test Meeting",
			Platform = "GoogleMeet",
			BotName = "TestBot",
			IsBotAdded = true,
			CreatedAt = now,
			ClosedAt = now,
			Duration = "30m",
			Status = status,
			IsFavorite = false,
			Participants = [],
			Guests = [],
			Entries = []
		};
	}
}
