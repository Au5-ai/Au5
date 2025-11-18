using Au5.Application.Features.Meetings.Export;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.Export;

public class ExportQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly ExportToTextQueryHandler _handler;

	public ExportQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_handler = new ExportToTextQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingDoesNotExist()
	{
		var meetingId = Guid.NewGuid();
		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting>().BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("No meeting with this ID was found.", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFormattedText_When_MeetingExists()
	{
		var meetingId = Guid.NewGuid();
		var createdAt = new DateTime(2025, 11, 15, 10, 0, 0);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Test Meeting",
			CreatedAt = createdAt,
			Duration = "00:30:00",
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Meeting Transcription: Test Meeting", result.Data);
		Assert.Contains("Duration: 30 minutes", result.Data);
	}

	[Fact]
	public async Task Should_IncludeParticipants_When_ParticipantsExist()
	{
		var meetingId = Guid.NewGuid();
		var userId1 = Guid.NewGuid();
		var userId2 = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Team Sync",
			CreatedAt = DateTime.UtcNow,
			Duration = "00:45:00",
			Participants =
			[
				new ParticipantInMeeting
				{
					UserId = userId1,
					User = new User { Id = userId1, FullName = "John Doe" }
				},
				new ParticipantInMeeting
				{
					UserId = userId2,
					User = new User { Id = userId2, FullName = "Jane Smith" }
				}

			],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Participants: John Doe, Jane Smith", result.Data);
	}

	[Fact]
	public async Task Should_IncludeGuests_When_GuestsExist()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Client Meeting",
			CreatedAt = DateTime.UtcNow,
			Duration = "01:00:00",
			Participants = [],
			Guests =
			[
				new GuestsInMeeting { FullName = "Guest User 1" },
				new GuestsInMeeting { FullName = "Guest User 2" }
			],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Participants: Guest User 1, Guest User 2", result.Data);
	}

	[Fact]
	public async Task Should_IncludeBothParticipantsAndGuests_When_BothExist()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Mixed Meeting",
			CreatedAt = DateTime.UtcNow,
			Duration = "00:30:00",
			Participants =
			[
				new ParticipantInMeeting
				{
					UserId = userId,
					User = new User { Id = userId, FullName = "Regular User" }
				}

			],
			Guests =
			[
				new GuestsInMeeting { FullName = "Guest User" }
			],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Participants: Regular User, Guest User", result.Data);
	}

	[Fact]
	public async Task Should_ShowNoParticipants_When_NoParticipantsOrGuests()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Empty Meeting",
			CreatedAt = DateTime.UtcNow,
			Duration = "00:15:00",
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Participants: No participants", result.Data);
	}

	[Fact]
	public async Task Should_IncludeTranscriptEntries_When_EntriesExist()
	{
		var meetingId = Guid.NewGuid();
		var createdAt = new DateTime(2025, 11, 15, 10, 0, 0);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Discussion",
			CreatedAt = createdAt,
			Duration = "00:20:00",
			Participants = [],
			Guests = [],
			Entries =
			[
				new Entry
				{
					FullName = "Alice",
					Content = "Hello everyone",
					Timestamp = createdAt.AddMinutes(1)
				},
				new Entry
				{
					FullName = "Bob",
					Content = "Hi Alice",
					Timestamp = createdAt.AddMinutes(2)
				},
				new Entry
				{
					FullName = "Alice",
					Content = "Let's start the meeting",
					Timestamp = createdAt.AddMinutes(3)
				}

			]
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Transcript", result.Data);
		Assert.Contains("01:00 Alice: Hello everyone", result.Data);
		Assert.Contains("02:00 Bob: Hi Alice", result.Data);
		Assert.Contains("03:00 Alice: Let's start the meeting", result.Data);
	}

	[Fact]
	public async Task Should_OrderEntriesByTimestamp_When_EntriesAreUnordered()
	{
		var meetingId = Guid.NewGuid();
		var createdAt = new DateTime(2025, 11, 15, 10, 0, 0);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Unordered Discussion",
			CreatedAt = createdAt,
			Duration = "00:10:00",
			Participants = [],
			Guests = [],
			Entries =
			[
				new Entry
				{
					FullName = "Charlie",
					Content = "Third message",
					Timestamp = createdAt.AddMinutes(5)
				},
				new Entry
				{
					FullName = "Alice",
					Content = "First message",
					Timestamp = createdAt.AddMinutes(1)
				},
				new Entry
				{
					FullName = "Bob",
					Content = "Second message",
					Timestamp = createdAt.AddMinutes(3)
				}

			]
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var lines = result.Data.Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries);
		var transcriptLines = lines.SkipWhile(l => !l.Contains("---")).Skip(1).ToArray();

		Assert.Contains("Alice: First message", transcriptLines[0]);
		Assert.Contains("Bob: Second message", transcriptLines[1]);
		Assert.Contains("Charlie: Third message", transcriptLines[2]);
	}

	[Fact]
	public async Task Should_HandleNullDuration_When_DurationIsNull()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "No Duration",
			CreatedAt = DateTime.UtcNow,
			Duration = null,
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Duration: 0 minutes", result.Data);
	}

	[Fact]
	public async Task Should_HandleEmptyDuration_When_DurationIsEmpty()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Empty Duration",
			CreatedAt = DateTime.UtcNow,
			Duration = string.Empty,
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Duration: 0 minutes", result.Data);
	}

	[Fact]
	public async Task Should_HandleInvalidDuration_When_DurationIsInvalidFormat()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Invalid Duration",
			CreatedAt = DateTime.UtcNow,
			Duration = "invalid",
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Duration: 0 minutes", result.Data);
	}

	[Fact]
	public async Task Should_FormatDurationCorrectly_When_DurationIsHours()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Long Meeting",
			CreatedAt = DateTime.UtcNow,
			Duration = "02:30:00",
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Duration: 150 minutes", result.Data);
	}

	[Fact]
	public async Task Should_CalculateTimelineCorrectly_When_EntriesHaveVariousTimestamps()
	{
		var meetingId = Guid.NewGuid();
		var createdAt = new DateTime(2025, 11, 15, 10, 0, 0);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Timeline Test",
			CreatedAt = createdAt,
			Duration = "01:00:00",
			Participants = [],
			Guests = [],
			Entries =
			[
				new Entry
				{
					FullName = "Speaker",
					Content = "At 30 seconds",
					Timestamp = createdAt.AddSeconds(30)
				},
				new Entry
				{
					FullName = "Speaker",
					Content = "At 15 minutes",
					Timestamp = createdAt.AddMinutes(15)
				},
				new Entry
				{
					FullName = "Speaker",
					Content = "At 45 minutes 30 seconds",
					Timestamp = createdAt.AddMinutes(45).AddSeconds(30)
				}

			]
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("00:30 Speaker: At 30 seconds", result.Data);
		Assert.Contains("15:00 Speaker: At 15 minutes", result.Data);
		Assert.Contains("45:30 Speaker: At 45 minutes 30 seconds", result.Data);
	}

	[Fact]
	public async Task Should_IncludeTranscriptHeader_When_ExportingMeeting()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Header Test",
			CreatedAt = DateTime.UtcNow,
			Duration = "00:30:00",
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Transcript", result.Data);
		Assert.Contains("--------------------------------------------------", result.Data);
	}

	[Fact]
	public async Task Should_FormatCreatedAtDate_When_ExportingMeeting()
	{
		var meetingId = Guid.NewGuid();
		var createdAt = new DateTime(2025, 11, 15, 14, 30, 45);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Date Format Test",
			CreatedAt = createdAt,
			Duration = "00:30:00",
			Participants = [],
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Meeting started:", result.Data);
		Assert.Contains("Date Format Test", result.Data);
		Assert.Contains("2025", result.Data);
		Assert.Contains("Duration: 30 minutes", result.Data);
	}

	[Fact]
	public async Task Should_HandleNullParticipantsList_When_ParticipantsIsNull()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Null Participants",
			CreatedAt = DateTime.UtcNow,
			Duration = "00:30:00",
			Participants = null,
			Guests = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Participants: No participants", result.Data);
	}

	[Fact]
	public async Task Should_HandleNullGuestsList_When_GuestsIsNull()
	{
		var meetingId = Guid.NewGuid();

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Null Guests",
			CreatedAt = DateTime.UtcNow,
			Duration = "00:30:00",
			Participants = [],
			Guests = null,
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Participants: No participants", result.Data);
	}

	[Fact]
	public async Task Should_HandleComplexScenario_When_AllDataIsPresent()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var createdAt = new DateTime(2025, 11, 15, 9, 0, 0);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetName = "Sprint Planning",
			CreatedAt = createdAt,
			Duration = "01:30:00",
			Participants =
			[
				new ParticipantInMeeting
				{
					UserId = userId,
					User = new User { Id = userId, FullName = "Product Owner" }
				}

			],
			Guests =
			[
				new GuestsInMeeting { FullName = "Stakeholder" }
			],
			Entries =
			[
				new Entry
				{
					FullName = "Product Owner",
					Content = "Let's review the backlog",
					Timestamp = createdAt.AddMinutes(5)
				},
				new Entry
				{
					FullName = "Stakeholder",
					Content = "Sounds good",
					Timestamp = createdAt.AddMinutes(6)
				}

			]
		};

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var query = new ExportQuery(meetingId, "text");

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Contains("Meeting Transcription: Sprint Planning", result.Data);
		Assert.Contains("Duration: 90 minutes", result.Data);
		Assert.Contains("Participants: Product Owner, Stakeholder", result.Data);
		Assert.Contains("05:00 Product Owner: Let's review the backlog", result.Data);
		Assert.Contains("06:00 Stakeholder: Sounds good", result.Data);
	}
}
