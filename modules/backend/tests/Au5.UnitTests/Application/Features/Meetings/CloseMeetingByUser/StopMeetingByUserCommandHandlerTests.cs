using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Meetings.CloseMeetingByUser;
using Au5.Domain.Entities;
using Au5.Shared;
using Microsoft.Extensions.Logging;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.CloseMeetingByUser;
public class CloseMeetingByUserCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IMeetingService> _meetingServiceMock;
	private readonly Mock<IBotFatherAdapter> _botFatherAdapter;
	private readonly Mock<ILogger<CloseMeetingByUserCommandHandler>> _loggerMock;
	private readonly CloseMeetingByUserCommandHandler _handler;

	public CloseMeetingByUserCommandHandlerTests()
	{
		_dbContextMock = new();
		_meetingServiceMock = new();
		_botFatherAdapter = new();
		_loggerMock = new();
		_handler = new CloseMeetingByUserCommandHandler(_loggerMock.Object, _dbContextMock.Object, _meetingServiceMock.Object, _botFatherAdapter.Object);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingNotFound()
	{
		var systemConfig = new SystemConfig
		{
			BotFatherUrl = "http://botfather"
		};

		var meetingDbSet = new List<Meeting>().BuildMockDbSet();
		var configDbSet = new List<SystemConfig> { systemConfig }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(configDbSet.Object);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var command = new CloseMeetingByUserCommand(Guid.NewGuid(), "meet-1");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Meeting not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_MeetingContentIsNull()
	{
		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet-2",
			Status = MeetingStatus.AddingBot,
			CreatedAt = DateTime.Now.AddHours(-1)
		};

		var systemConfig = new SystemConfig
		{
			BotFatherUrl = "http://botfather"
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		var configDbSet = new List<SystemConfig> { systemConfig }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(configDbSet.Object);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		_meetingServiceMock.Setup(x => x.CloseMeeting(meeting.MeetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync((Meeting)null);

		var command = new CloseMeetingByUserCommand(meeting.Id, meeting.MeetId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("There is No Meeting Content", result.Error.Description);
	}

	[Fact]
	public async Task Should_CloseMeetingAndReturnSuccess_When_MeetingAndContentExist()
	{
		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet-3",
			Status = MeetingStatus.Recording,
			CreatedAt = DateTime.Now.AddHours(-2)
		};
		var systemConfig = new SystemConfig
		{
			BotFatherUrl = "http://botfather"
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		var configDbSet = new List<SystemConfig> { systemConfig }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(configDbSet.Object);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		_meetingServiceMock.Setup(x => x.CloseMeeting(meeting.MeetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new CloseMeetingByUserCommand(meeting.Id, meeting.MeetId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
		Assert.Equal(meetingContent.Entries, meeting.Entries);
		Assert.Equal(meetingContent.Participants, meeting.Participants);
		Assert.Equal(meetingContent.Guests, meeting.Guests);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet-4",
			Status = MeetingStatus.AddingBot,
			CreatedAt = DateTime.Now.AddHours(-2)
		};

		var systemConfig = new SystemConfig
		{
			BotFatherUrl = "http://botfather"
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		var configDbSet = new List<SystemConfig> { systemConfig }.BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(configDbSet.Object);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		_meetingServiceMock.Setup(x => x.CloseMeeting(meeting.MeetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure(description: "Failed to close meeting")));

		var command = new CloseMeetingByUserCommand(meeting.Id, meeting.MeetId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Failed to close meeting", result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_ThereIsNoConfigs()
	{
		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet-4",
			Status = MeetingStatus.AddingBot,
			CreatedAt = DateTime.Now.AddHours(-2)
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		var configDbSet = new List<SystemConfig>().BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(configDbSet.Object);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};
		var command = new CloseMeetingByUserCommand(meeting.Id, meeting.MeetId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.SystemIsNotConfigured, result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
		_botFatherAdapter.Verify(x => x.RemoveBotContainerAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
	}
}
