using Au5.Application.Features.Meetings.ToggleArchive;
using Au5.Domain.Entities;
using Au5.Shared;
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
		var command = new ToggleArchiveCommand(meetingId, meetId);

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
		Assert.Equal(MeetingStatus.Archived, meeting.Status);
	}

	[Fact]
	public async Task Should_ToggleToUnarchived_When_MeetingIsAlreadyArchived()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId, meetId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, MeetingStatus.Archived);
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
		Assert.False(result.Data.IsArchived);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingDoesNotExist()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId, meetId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meetings = new List<Meeting>();
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("General.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingExistsButMeetIdDoesNotMatch()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId, meetId);

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
		Assert.Equal("General.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnForbidden_When_UserIsNotParticipant()
	{
		var userId = Guid.NewGuid();
		var otherUserId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId, meetId);

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
		Assert.Equal("General.Forbidden", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_TryingToArchiveActiveMeeting()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId, meetId);

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
		Assert.Equal("General.BadRequest", result.Error.Code);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_DatabaseSaveFails()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleArchiveCommand(meetingId, meetId);

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
		Assert.Equal("General.Failure", result.Error.Code);
	}

	private static Meeting CreateMeeting(Guid meetingId, string meetId, MeetingStatus status)
	{
		return new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			MeetName = "Test Meeting",
			Platform = "GoogleMeet",
			BotName = "TestBot",
			IsBotAdded = true,
			CreatedAt = DateTime.UtcNow,
			ClosedAt = DateTime.UtcNow,
			Duration = "30m",
			Status = status,
			IsFavorite = false,
			Participants = [],
			Guests = [],
			Entries = []
		};
	}
}