using Au5.Application.Features.Meetings.ToggleFavorite;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.ToggleFavorite;

public class ToggleFavoriteCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<DbSet<Meeting>> _meetingDbSetMock;
	private readonly ToggleFavoriteCommandHandler _handler;

	public ToggleFavoriteCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_meetingDbSetMock = new Mock<DbSet<Meeting>>();

		_handler = new ToggleFavoriteCommandHandler(
			_dbContextMock.Object,
			_currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Handle_ShouldReturnSuccess_WhenMeetingExistsAndUserIsParticipant()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleFavoriteCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, false);
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
		Assert.True(result.Data.IsFavorite);
		Assert.True(meeting.IsFavorite);
	}

	[Fact]
	public async Task Handle_ShouldToggleFavoriteStatus_WhenMeetingIsAlreadyFavorite()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleFavoriteCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, true);
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
		Assert.False(result.Data.IsFavorite);
		Assert.False(meeting.IsFavorite);
	}

	[Fact]
	public async Task Handle_ShouldReturnNotFound_WhenMeetingDoesNotExist()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var command = new ToggleFavoriteCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meetings = new List<Meeting>();
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotFound", result.Error.Code);
	}

	[Fact]
	public async Task Handle_ShouldReturnNotFound_WhenMeetingExistsButMeetIdDoesNotMatch()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var command = new ToggleFavoriteCommand(Guid.NewGuid());

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, "different-meet-id", false);
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
	public async Task Handle_ShouldReturnForbidden_WhenUserIsNotParticipant()
	{
		var userId = Guid.NewGuid();
		var otherUserId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleFavoriteCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, false);
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
	public async Task Handle_ShouldReturnFailure_WhenDatabaseSaveFails()
	{
		var userId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-id";
		var command = new ToggleFavoriteCommand(meetingId);

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

		var meeting = CreateMeeting(meetingId, meetId, false);
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

	private static Meeting CreateMeeting(Guid meetingId, string meetId, bool isFavorite)
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
			Status = MeetingStatus.Ended,
			IsFavorite = isFavorite,
			Participants = [],
			Guests = [],
			Entries = []
		};
	}
}
