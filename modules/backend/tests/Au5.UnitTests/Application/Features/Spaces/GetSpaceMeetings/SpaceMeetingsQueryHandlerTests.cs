using Au5.Application.Features.Spaces.GetSpaceMeetings;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Spaces.GetSpaceMeetings;

public class SpaceMeetingsQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly GetSpaceMeetingsQueryHandler _handler;
	private readonly Guid _userId;
	private readonly Guid _spaceId;

	public SpaceMeetingsQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_userId = Guid.NewGuid();
		_spaceId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(_userId);

		_handler = new GetSpaceMeetingsQueryHandler(_dbContextMock.Object, _currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnError_When_UserDoesNotHaveAccessToSpace()
	{
		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace>().BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Space.Access.Denied", result.Error.Code);
		Assert.Equal("You do not have access to this space", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_UserHasAccessButNoMeetingsExist()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(new List<MeetingSpace>().BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_ReturnMeetings_When_UserHasAccessAndMeetingsExist()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			MeetName = "Team Meeting",
			Platform = "Google Meet",
			BotName = "Bot1",
			Status = MeetingStatus.Ended,
			Duration = "30m",
			IsFavorite = false,
			Participants =
			[
				new ParticipantInMeeting { UserId = _userId, User = user }
			],
			Guests = []
		};

		var meetingSpace = new MeetingSpace
		{
			SpaceId = _spaceId,
			MeetingId = meeting.Id,
			Meeting = meeting,
			CreatedAt = new DateTime(2025, 11, 16, 10, 0, 0)
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(new List<MeetingSpace> { meetingSpace }.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);
	}

	[Fact]
	public async Task Should_GroupMeetingsByDate_When_MultipleMeetingsExist()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var date1 = new DateTime(2025, 11, 16, 10, 0, 0);
		var date2 = new DateTime(2025, 11, 17, 14, 0, 0);

		var meeting1 = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet1",
			MeetName = "Meeting 1",
			Platform = "Zoom",
			BotName = "Bot1",
			Status = MeetingStatus.Ended,
			Duration = "30m",
			IsFavorite = false,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests = []
		};

		var meeting2 = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet2",
			MeetName = "Meeting 2",
			Platform = "Teams",
			BotName = "Bot2",
			Status = MeetingStatus.Recording,
			Duration = "45m",
			IsFavorite = true,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests = []
		};

		var meetingSpaces = new List<MeetingSpace>
		{
			new() { SpaceId = _spaceId, MeetingId = meeting1.Id, Meeting = meeting1, CreatedAt = date1 },
			new() { SpaceId = _spaceId, MeetingId = meeting2.Id, Meeting = meeting2, CreatedAt = date2 }
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(meetingSpaces.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(2, result.Data.Count);
	}

	[Fact]
	public async Task Should_FormatDateCorrectly_When_ReturningMeetings()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet1",
			MeetName = "Test Meeting",
			Platform = "Zoom",
			BotName = "Bot1",
			Status = MeetingStatus.Ended,
			Duration = "30m",
			IsFavorite = false,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests = []
		};

		var createdDate = new DateTime(2025, 11, 16, 14, 30, 0);
		var meetingSpace = new MeetingSpace
		{
			SpaceId = _spaceId,
			MeetingId = meeting.Id,
			Meeting = meeting,
			CreatedAt = createdDate
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(new List<MeetingSpace> { meetingSpace }.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var groupedResponse = result.Data.First();
		Assert.Equal("Sunday, November 16", groupedResponse.Date);
		Assert.Equal("2:30 PM", groupedResponse.Items.First().Time);
	}

	[Fact]
	public async Task Should_IncludeGuestNames_When_MeetingHasGuests()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet1",
			MeetName = "Meeting with Guests",
			Platform = "Zoom",
			BotName = "Bot1",
			Status = MeetingStatus.Ended,
			Duration = "30m",
			IsFavorite = false,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests =
			[
				new GuestsInMeeting { FullName = "Guest One" },
				new GuestsInMeeting { FullName = "Guest Two" }
			]
		};

		var meetingSpace = new MeetingSpace
		{
			SpaceId = _spaceId,
			MeetingId = meeting.Id,
			Meeting = meeting,
			CreatedAt = DateTime.Now
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(new List<MeetingSpace> { meetingSpace }.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var meetingItem = result.Data.First().Items.First();
		Assert.Equal(2, meetingItem.Guests.Count);
		Assert.Contains("Guest One", meetingItem.Guests);
		Assert.Contains("Guest Two", meetingItem.Guests);
	}

	[Fact]
	public async Task Should_IncludeParticipantDetails_When_MeetingHasParticipants()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user1 = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "john.jpg"
		};

		var user2 = new User
		{
			Id = Guid.NewGuid(),
			FullName = "Jane Smith",
			Email = "jane@example.com",
			PictureUrl = "jane.jpg"
		};

		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet1",
			MeetName = "Team Meeting",
			Platform = "Zoom",
			BotName = "Bot1",
			Status = MeetingStatus.Ended,
			Duration = "30m",
			IsFavorite = false,
			Participants =
			[
				new ParticipantInMeeting { UserId = user1.Id, User = user1 },
				new ParticipantInMeeting { UserId = user2.Id, User = user2 }
			],
			Guests = []
		};

		var meetingSpace = new MeetingSpace
		{
			SpaceId = _spaceId,
			MeetingId = meeting.Id,
			Meeting = meeting,
			CreatedAt = DateTime.Now
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(new List<MeetingSpace> { meetingSpace }.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var participants = result.Data.First().Items.First().Participants;
		Assert.Equal(2, participants.Count);
		Assert.Contains(participants, p => p.FullName == "John Doe" && p.Email == "john@example.com");
		Assert.Contains(participants, p => p.FullName == "Jane Smith" && p.Email == "jane@example.com");
	}

	[Fact]
	public async Task Should_HandleEmptyDuration_When_MeetingDurationIsNull()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet1",
			MeetName = "Meeting",
			Platform = "Zoom",
			BotName = "Bot1",
			Status = MeetingStatus.Recording,
			Duration = null,
			IsFavorite = false,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests = []
		};

		var meetingSpace = new MeetingSpace
		{
			SpaceId = _spaceId,
			MeetingId = meeting.Id,
			Meeting = meeting,
			CreatedAt = DateTime.Now
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(new List<MeetingSpace> { meetingSpace }.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("0m", result.Data.First().Items.First().Duration);
	}

	[Fact]
	public async Task Should_OrderByCreatedAtDescending_When_MultipleMeetingsExist()
	{
		var userSpace = new UserSpace
		{
			UserId = _userId,
			SpaceId = _spaceId
		};

		var user = new User
		{
			Id = _userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var oldMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "old",
			MeetName = "Old Meeting",
			Platform = "Zoom",
			BotName = "Bot1",
			Status = MeetingStatus.Ended,
			Duration = "30m",
			IsFavorite = false,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests = []
		};

		var newMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "new",
			MeetName = "New Meeting",
			Platform = "Teams",
			BotName = "Bot2",
			Status = MeetingStatus.Recording,
			Duration = "45m",
			IsFavorite = false,
			Participants = [new ParticipantInMeeting { UserId = _userId, User = user }],
			Guests = []
		};

		var meetingSpaces = new List<MeetingSpace>
		{
			new() { SpaceId = _spaceId, MeetingId = oldMeeting.Id, Meeting = oldMeeting, CreatedAt = new DateTime(2025, 11, 15) },
			new() { SpaceId = _spaceId, MeetingId = newMeeting.Id, Meeting = newMeeting, CreatedAt = new DateTime(2025, 11, 16) }
		};

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace> { userSpace }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<MeetingSpace>())
			.Returns(meetingSpaces.BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var dates = result.Data.Select(g => g.Date).ToList();
		Assert.Equal("Sunday, November 16", dates[0]);
		Assert.Equal("Saturday, November 15", dates[1]);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		_dbContextMock.Setup(db => db.Set<UserSpace>())
			.Returns(new List<UserSpace>().BuildMockDbSet().Object);

		var query = new SpaceMeetingsQuery(_spaceId);

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<UserSpace>(), Times.Once);
	}
}
