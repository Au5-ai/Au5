using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Meetings.StopMeetingByUser;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.Application.UnitTests.Features.Meetings.StopMeetingByUser;
public class StopMeetingByUserCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IMeetingService> _meetingServiceMock;
	private readonly StopMeetingByUserCommandHandler _handler;

	public StopMeetingByUserCommandHandlerTests()
	{
		_dbContextMock = new();
		_meetingServiceMock = new();
		_handler = new StopMeetingByUserCommandHandler(_dbContextMock.Object, _meetingServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnBadRequest_When_MeetingNotFound()
	{
		var dbSet = new List<Meeting>().BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(dbSet.Object);

		var command = new StopMeetingByUserCommand(Guid.NewGuid(), "meet-1");

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

		var dbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(dbSet.Object);

		_meetingServiceMock.Setup(x => x.StopMeeting(meeting.MeetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync((Meeting)null);

		var command = new StopMeetingByUserCommand(meeting.Id, meeting.MeetId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("There is No Meeting Content", result.Error.Description);
	}

	[Fact]
	public async Task Should_StopMeetingAndReturnSuccess_When_MeetingAndContentExist()
	{
		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet-3",
			Status = MeetingStatus.Recording,
			CreatedAt = DateTime.Now.AddHours(-2)
		};

		var dbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(dbSet.Object);

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		_meetingServiceMock.Setup(x => x.StopMeeting(meeting.MeetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new StopMeetingByUserCommand(meeting.Id, meeting.MeetId);

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

		var dbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(dbSet.Object);

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};

		_meetingServiceMock.Setup(x => x.StopMeeting(meeting.MeetId, It.IsAny<CancellationToken>()))
			.ReturnsAsync(meetingContent);

		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure(description: "Failed to stop meeting")));

		var command = new StopMeetingByUserCommand(meeting.Id, meeting.MeetId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Failed to stop meeting", result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}
}
