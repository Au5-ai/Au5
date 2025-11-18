using System.Net;
using Au5.Application.Common.Options;
using Au5.Application.Features.Meetings.CloseMeetingByUser;

using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

using Meeting = Au5.Domain.Entities.Meeting;

namespace Au5.UnitTests.Application.Features.Meetings.CloseMeetingByUser;

public class CloseMeetingByUserCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IMeetingService> _meetingServiceMock;
	private readonly Mock<IBotFatherAdapter> _botFatherMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _organizationOptionsMock;
	private readonly CloseMeetingByUserCommandHandler _handler;
	private readonly DateTime _testDateTime;

	public CloseMeetingByUserCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_meetingServiceMock = new Mock<IMeetingService>();
		_botFatherMock = new Mock<IBotFatherAdapter>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_dataProviderMock = new Mock<IDataProvider>();
		_organizationOptionsMock = new Mock<IOptions<OrganizationOptions>>();

		_testDateTime = new DateTime(2025, 11, 18, 10, 30, 0);

		var organizationOptions = new OrganizationOptions
		{
			BotFatherUrl = "https://botfather.example.com"
		};

		_organizationOptionsMock.Setup(x => x.Value).Returns(organizationOptions);
		_dataProviderMock.Setup(x => x.Now).Returns(_testDateTime);

		_handler = new CloseMeetingByUserCommandHandler(
			_dbContextMock.Object,
			_meetingServiceMock.Object,
			_botFatherMock.Object,
			_currentUserServiceMock.Object,
			_dataProviderMock.Object,
			_organizationOptionsMock.Object);
	}

	[Fact]
	public async Task Should_ReturnTrue_When_MeetingClosedSuccessfully()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = "test-meet-123";
		var hashToken = "test-hash-token";
		var createdAt = _testDateTime.AddHours(-2);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			HashToken = hashToken,
			Status = MeetingStatus.Recording,
			CreatedAt = createdAt
		};

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_botFatherMock.Setup(x => x.RemoveBotContainerAsync(
				"https://botfather.example.com",
				meetId,
				hashToken,
				It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"Container removed");

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
		Assert.Equal(_testDateTime, meeting.ClosedAt);
		Assert.Equal(userId, meeting.ClosedMeetingUserId);
		Assert.NotNull(meeting.Duration);
		_meetingServiceMock.Verify(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		_botFatherMock.Verify(
			x => x.RemoveBotContainerAsync(
				"https://botfather.example.com",
				meetId,
				hashToken,
				It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingNotFound()
	{
		var meetingId = Guid.NewGuid();

		var meetingDbSet = new List<Meeting> { }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Equal(AppResources.Meeting.NotFound, result.Error.Description);
		_meetingServiceMock.Verify(x => x.CloseMeeting(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingAlreadyEnded()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-123";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			Status = MeetingStatus.Ended,
			CreatedAt = _testDateTime.AddHours(-2)
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.BadRequest, result.Error.Type);
		Assert.Equal(AppResources.Meeting.NotFound, result.Error.Description);
		_meetingServiceMock.Verify(x => x.CloseMeeting(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_MeetingServiceReturnsNull()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "test-meet-123";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			Status = MeetingStatus.Recording,
			CreatedAt = _testDateTime.AddHours(-2)
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync((Meeting)null);

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Equal(AppResources.Meeting.NoContent, result.Error.Description);
		_meetingServiceMock.Verify(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = "test-meet-123";
		var hashToken = "test-hash-token";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			HashToken = hashToken,
			Status = MeetingStatus.Recording,
			CreatedAt = _testDateTime.AddHours(-2)
		};

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Error.Failure(description: "Database error"));

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(HttpStatusCode.InternalServerError, result.Error.Type);
		Assert.Equal(AppResources.Meeting.FailedToClose, result.Error.Description);
		_meetingServiceMock.Verify(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		_botFatherMock.Verify(
			x => x.RemoveBotContainerAsync(
				It.IsAny<string>(),
				It.IsAny<string>(),
				It.IsAny<string>(),
				It.IsAny<CancellationToken>()),
			Times.Never);
	}

	[Fact]
	public async Task Should_UpdateMeetingProperties_When_Closed()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = "test-meet-123";
		var hashToken = "test-hash-token";
		var createdAt = _testDateTime.AddHours(-2);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			HashToken = hashToken,
			Status = MeetingStatus.Recording,
			CreatedAt = createdAt
		};

		var entries = new List<Entry>
		{
			new() { Id = 1 }
		};

		var participants = new List<ParticipantInMeeting>
		{
			new() { Id = 1 }
		};

		var guests = new List<GuestsInMeeting>
		{
			new() { Id = 1 }
		};

		var meetingContent = new Meeting
		{
			Entries = entries,
			Participants = participants,
			Guests = guests
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_botFatherMock.Setup(
				x => x.RemoveBotContainerAsync(
					It.IsAny<string>(),
					It.IsAny<string>(),
					It.IsAny<string>(),
					It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"Container removed");

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
		Assert.Equal(_testDateTime, meeting.ClosedAt);
		Assert.Equal(userId, meeting.ClosedMeetingUserId);
		Assert.Equal(entries, meeting.Entries);
		Assert.Equal(participants, meeting.Participants);
		Assert.Equal(guests, meeting.Guests);
		Assert.NotNull(meeting.Duration);
	}

	[Fact]
	public async Task Should_HandlePausedMeeting_When_Closing()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = "test-meet-123";
		var hashToken = "test-hash-token";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			HashToken = hashToken,
			Status = MeetingStatus.Paused,
			CreatedAt = _testDateTime.AddHours(-1)
		};

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_botFatherMock.Setup(
				x => x.RemoveBotContainerAsync(
					It.IsAny<string>(),
					It.IsAny<string>(),
					It.IsAny<string>(),
					It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"Container removed");

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
		_meetingServiceMock.Verify(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_RemoveBotContainer_When_SaveSucceeds()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = "test-meet-123";
		var hashToken = "test-hash-token";
		var botFatherUrl = "https://botfather.example.com";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			HashToken = hashToken,
			Status = MeetingStatus.Recording,
			CreatedAt = _testDateTime.AddHours(-2)
		};

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_botFatherMock.Setup(
				x => x.RemoveBotContainerAsync(
					botFatherUrl,
					meetId,
					hashToken,
					It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"Container removed");

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_botFatherMock.Verify(
			x => x.RemoveBotContainerAsync(
				botFatherUrl,
				meetId,
				hashToken,
				It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_NotRemoveBotContainer_When_SaveFails()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = "test-meet-123";
		var hashToken = "test-hash-token";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			HashToken = hashToken,
			Status = MeetingStatus.Recording,
			CreatedAt = _testDateTime.AddHours(-2)
		};

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);
		_meetingServiceMock.Setup(x => x.CloseMeeting(meetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Error.Failure(description: "Database error"));

		var command = new CloseMeetingByUserCommand(meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		_botFatherMock.Verify(
			x => x.RemoveBotContainerAsync(
				It.IsAny<string>(),
				It.IsAny<string>(),
				It.IsAny<string>(),
				It.IsAny<CancellationToken>()),
			Times.Never);
	}
}
