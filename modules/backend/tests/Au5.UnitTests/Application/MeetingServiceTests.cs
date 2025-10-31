using Au5.Application.Messages;
using Au5.Application.Services;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application;

public class MeetingServiceTests
{
	private readonly Mock<ICacheProvider> _cacheProviderMock;
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IDataProvider> _dateTimeProviderMock;
	private readonly MeetingService _meetingService;

	public MeetingServiceTests()
	{
		_cacheProviderMock = new Mock<ICacheProvider>();
		_dbContextMock = new Mock<IApplicationDbContext>();
		_dateTimeProviderMock = new Mock<IDataProvider>();

		// Set up the default SystemConfig for tests
		var systemConfigs = new List<SystemConfig>
		{
			new() { Id = Guid.NewGuid(), BotName = "Cando" }
		};

		var systemConfigDbSet = systemConfigs.BuildMockDbSet();
		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);

		_meetingService = new MeetingService(_cacheProviderMock.Object, _dbContextMock.Object, _dateTimeProviderMock.Object);
	}

	[Fact]
	public async Task AddUserToMeeting_WhenMeetingDoesNotExist_ShouldCreateNewMeeting()
	{
		var userJoined = new UserJoinedInMeetingMessage
		{
			MeetId = "meet123",
			Platform = "GoogleMeet",
			User = new Participant
			{
				Id = Guid.NewGuid(),
				FullName = "Mohammad K",
				PictureUrl = "https://example.com/picture.jpg",
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _meetingService.AddUserToMeeting(userJoined);

		Assert.NotNull(result);
		Assert.Equal(userJoined.MeetId, result.MeetId);
		Assert.Equal(userJoined.Platform, result.Platform);
		Assert.Equal(MeetingStatus.AddingBot, result.Status);
		Assert.Single(result.Participants);
		Assert.Equal(userJoined.User.Id, result.Participants.First().UserId);

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task AddUserToMeeting_WhenMeetingIsEnded_ShouldCreateNewMeeting()
	{
		var existingMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Ended,
			Participants = []
		};

		var userJoined = new UserJoinedInMeetingMessage
		{
			MeetId = "meet123",
			Platform = "GoogleMeet",
			User = new Participant
			{
				Id = Guid.NewGuid(),
				FullName = "Mohammad K",
				PictureUrl = "https://example.com/picture.jpg",
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(existingMeeting);

		var result = await _meetingService.AddUserToMeeting(userJoined);

		Assert.NotNull(result);
		Assert.Equal(userJoined.MeetId, result.MeetId);
		Assert.Equal(MeetingStatus.AddingBot, result.Status);
		Assert.NotEqual(existingMeeting.Id, result.Id); // Should be a new meeting
	}

	[Fact]
	public async Task AddUserToMeeting_WhenMeetingExistsAndUserNotInMeeting_ShouldAddUserToExistingMeeting()
	{
		var existingParticipantId = Guid.NewGuid();
		var newUserId = Guid.NewGuid();

		var existingMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Participants =
			[
				new() { UserId = existingParticipantId }
			]
		};

		var userJoined = new UserJoinedInMeetingMessage
		{
			MeetId = "meet123",
			Platform = "GoogleMeet",
			User = new Participant
			{
				Id = newUserId,
				FullName = "Jane Doe",
				PictureUrl = "https://example.com/jane.jpg",
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(existingMeeting);

		var result = await _meetingService.AddUserToMeeting(userJoined);

		Assert.NotNull(result);
		Assert.Equal(2, result.Participants.Count);
		Assert.Contains(result.Participants, p => p.UserId == existingParticipantId);
		Assert.Contains(result.Participants, p => p.UserId == newUserId);
	}

	[Fact]
	public async Task AddUserToMeeting_WhenUserAlreadyInMeeting_ShouldNotAddDuplicateUser()
	{
		var userId = Guid.NewGuid();

		var existingMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Participants =
			[
				new() { UserId = userId }
			]
		};

		var userJoined = new UserJoinedInMeetingMessage
		{
			MeetId = "meet123",
			Platform = "GoogleMeet",
			User = new Participant
			{
				Id = userId,
				FullName = "Mohammad K",
				PictureUrl = "https://example.com/john.jpg",
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(existingMeeting);

		var result = await _meetingService.AddUserToMeeting(userJoined);

		Assert.NotNull(result);
		Assert.Single(result.Participants);
		Assert.Equal(userId, result.Participants.First().UserId);
	}

	[Fact]
	public async Task AddGuestsToMeet_WhenMeetingDoesNotExist_ShouldNotAddGuests()
	{
		var guests = new List<Participant>
		{
			new()
			{
				Id = Guid.NewGuid(),
				FullName = "Guest User",
				PictureUrl = "https://example.com/guest.jpg"
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		await _meetingService.AddGuestsToMeet(guests, "meet123");

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task AddGuestsToMeet_WhenMeetingIsEnded_ShouldNotAddGuests()
	{
		var endedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Ended,
			Guests = []
		};

		var guests = new List<Participant>
		{
			new()
			{
				Id = Guid.NewGuid(),
				FullName = "Guest User",
				PictureUrl = "https://example.com/guest.jpg"
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(endedMeeting);

		await _meetingService.AddGuestsToMeet(guests, "meet123");

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task AddGuestsToMeet_WhenValidGuestsWithoutAccount_ShouldAddGuestsToMeeting()
	{
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Guests = []
		};

		var guests = new List<Participant>
		{
			new()
			{
				Id = Guid.NewGuid(),
				FullName = "Guest User 1",
				PictureUrl = "https://example.com/guest1.jpg"
			},
			new()
			{
				Id = Guid.NewGuid(),
				FullName = "Guest User 2",
				PictureUrl = "https://example.com/guest2.jpg"
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AddGuestsToMeet(guests, "meet123");

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.Is<Meeting>(m => m.Guests.Count == 2), TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task AddGuestsToMeet_WhenGuestAlreadyExists_ShouldNotAddDuplicateGuest()
	{
		var existingGuestName = "Existing Guest";
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Guests =
			[
				new()
				{
					MeetingId = Guid.NewGuid(),
					FullName = existingGuestName,
					PictureUrl = "https://example.com/existing.jpg"
				},
			]
		};

		var guests = new List<Participant>
		{
			new()
			{
				Id = Guid.NewGuid(),
				FullName = existingGuestName,
				PictureUrl = "https://example.com/guest.jpg"
			}
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AddGuestsToMeet(guests, "meet123");

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.Is<Meeting>(m => m.Guests.Count == 1), TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task BotIsAdded_WhenMeetingDoesNotExist_ShouldReturnEmptyString()
	{
		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _meetingService.BotIsAdded("meet123");

		Assert.Equal(string.Empty, result);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task BotIsAdded_WhenMeetingIsEnded_ShouldReturnEmptyString()
	{
		var endedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Ended,
			IsBotAdded = false
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(endedMeeting);

		var result = await _meetingService.BotIsAdded("meet123");

		Assert.Equal(string.Empty, result);
	}

	[Fact]
	public async Task BotIsAdded_WhenBotNotYetAdded_ShouldAddBotAndReturnBotName()
	{
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.AddingBot,
			IsBotAdded = false,
			BotName = null
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		var result = await _meetingService.BotIsAdded("meet123");

		Assert.Equal("Cando", result);
		Assert.True(activeMeeting.IsBotAdded);
		Assert.Equal("Cando", activeMeeting.BotName);
		Assert.Equal(MeetingStatus.Recording, activeMeeting.Status);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task BotIsAdded_WhenBotAlreadyAdded_ShouldReturnExistingBotName()
	{
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			IsBotAdded = true,
			BotName = "Cando"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		var result = await _meetingService.BotIsAdded("meet123");

		Assert.Equal("Cando", result);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task PauseMeeting_WhenMeetingDoesNotExist_ShouldReturnFalse()
	{
		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _meetingService.PauseMeeting("meet123", true);

		Assert.False(result);
	}

	[Fact]
	public async Task PauseMeeting_WhenMeetingIsEnded_ShouldReturnFalse()
	{
		var endedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Ended
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(endedMeeting);

		var result = await _meetingService.PauseMeeting("meet123", true);

		Assert.False(result);
	}

	[Fact]
	public async Task PauseMeeting_WhenPausingActiveMeeting_ShouldPauseMeetingAndReturnTrue()
	{
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		var result = await _meetingService.PauseMeeting("meet123", true);

		Assert.True(result);
		Assert.Equal(MeetingStatus.Paused, activeMeeting.Status);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task PauseMeeting_WhenResumingPausedMeeting_ShouldResumeMeetingAndReturnTrue()
	{
		var pausedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Paused
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(pausedMeeting);

		var result = await _meetingService.PauseMeeting("meet123", false);

		Assert.True(result);
		Assert.Equal(MeetingStatus.Recording, pausedMeeting.Status);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), pausedMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task UpsertBlock_WhenMeetingDoesNotExist_ShouldReturnFalse()
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		var entry = new EntryMessage
		{
			MeetId = "meet123",
			BlockId = Guid.NewGuid(),
			Content = "Test content",
			Participant = new Participant { Id = Guid.NewGuid(), FullName = "Mohammad K" },
			Timestamp = now,
			EntryType = "Transcription"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _meetingService.UpsertBlock(entry);

		Assert.False(result);
	}

	[Fact]
	public async Task UpsertBlock_WhenMeetingIsPaused_ShouldReturnFalse()
	{
		var pausedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Paused,
			Entries = []
		};

		var now = DateTime.Parse("2025-01-15T10:00:00");

		var entry = new EntryMessage
		{
			MeetId = "meet123",
			BlockId = Guid.NewGuid(),
			Content = "Test content",
			Participant = new Participant { Id = Guid.NewGuid(), FullName = "Mohammad K" },
			Timestamp = now,
			EntryType = "Transcription"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(pausedMeeting);

		var result = await _meetingService.UpsertBlock(entry);

		Assert.False(result);
	}

	[Fact]
	public async Task UpsertBlock_WhenBlockExists_ShouldUpdateExistingBlockAndReturnTrue()
	{
		var blockId = Guid.NewGuid();
		var participantId = Guid.NewGuid();

		var now = DateTime.Parse("2025-01-15T10:00:00");

		var existingEntry = new Entry
		{
			Id = 1,
			BlockId = blockId,
			Content = "Original content",
			ParticipantId = participantId,
			FullName = "Mohammad K",
			Timestamp = now.AddMinutes(-5),
			EntryType = "Transcription",
			Reactions = []
		};

		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = [existingEntry]
		};

		var entry = new EntryMessage
		{
			MeetId = "meet123",
			BlockId = blockId,
			Content = "Updated content",
			Participant = new Participant { Id = participantId, FullName = "Mohammad K" },
			Timestamp = now,
			EntryType = "Transcription"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		var result = await _meetingService.UpsertBlock(entry);

		Assert.True(result);
		Assert.Equal("Updated content", existingEntry.Content);
		Assert.Single(activeMeeting.Entries);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task UpsertBlock_WhenBlockDoesNotExist_ShouldCreateNewBlockAndReturnTrue()
	{
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = []
		};

		var now = DateTime.Parse("2025-01-15T10:00:00");

		var entry = new EntryMessage
		{
			MeetId = "meet123",
			BlockId = Guid.NewGuid(),
			Content = "New content",
			Participant = new Participant { Id = Guid.NewGuid(), FullName = "Jane Doe" },
			Timestamp = now,
			EntryType = "Transcription"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		var result = await _meetingService.UpsertBlock(entry);

		Assert.True(result);
		Assert.Single(activeMeeting.Entries);

		var addedEntry = activeMeeting.Entries.First();
		Assert.Equal(entry.BlockId, addedEntry.BlockId);
		Assert.Equal(entry.Content, addedEntry.Content);
		Assert.Equal(entry.Participant.Id, addedEntry.ParticipantId);
		Assert.Equal(entry.Participant.FullName, addedEntry.FullName);
		Assert.Equal(entry.EntryType, addedEntry.EntryType);
		Assert.Empty(addedEntry.Reactions);

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task AppliedReaction_WhenMeetingDoesNotExist_ShouldNotApplyReaction()
	{
		var reaction = new ReactionAppliedMessage
		{
			MeetId = "meet123",
			BlockId = Guid.NewGuid(),
			ReactionId = 1,
			User = new Participant { Id = Guid.NewGuid(), FullName = "Mohammad K" },
			ReactionType = "👍"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		await _meetingService.AppliedReaction(reaction);

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task AppliedReaction_WhenBlockDoesNotExist_ShouldNotApplyReaction()
	{
		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = []
		};

		var reaction = new ReactionAppliedMessage
		{
			MeetId = "meet123",
			BlockId = Guid.NewGuid(),
			ReactionId = 1,
			User = new Participant { Id = Guid.NewGuid(), FullName = "Mohammad K" },
			ReactionType = "👍"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AppliedReaction(reaction);

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task AppliedReaction_WhenReactionDoesNotExist_ShouldCreateNewReaction()
	{
		var blockId = Guid.NewGuid();
		var participantId = Guid.NewGuid();

		var entry = new Entry
		{
			Id = 1,
			BlockId = blockId,
			Content = "Test content",
			ParticipantId = Guid.NewGuid(),
			Reactions = []
		};

		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = [entry],
			Participants = [new ParticipantInMeeting() { UserId = participantId }]
		};

		var reaction = new ReactionAppliedMessage
		{
			MeetId = "meet123",
			BlockId = blockId,
			ReactionId = 1,
			User = new Participant { Id = participantId, FullName = "Mohammad K", PictureUrl = "Pic" },
			ReactionType = "👍"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AppliedReaction(reaction);

		Assert.Single(entry.Reactions);

		var addedReaction = entry.Reactions.First();
		Assert.Equal(reaction.ReactionId, addedReaction.ReactionId);
		Assert.Equal(entry.Id, addedReaction.EntryId);
		Assert.Single(addedReaction.Participants);
		Assert.Equal(participantId, addedReaction.Participants.First().Id);
	}

	[Fact]
	public async Task AppliedReaction_Should_ReturnNull_WhenParticipantNotExist()
	{
		var blockId = Guid.NewGuid();
		var participantId = Guid.NewGuid();

		var entry = new Entry
		{
			Id = 1,
			BlockId = blockId,
			Content = "Test content",
			ParticipantId = Guid.NewGuid(),
			Reactions = []
		};

		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = [entry],
			Participants = []
		};

		var reaction = new ReactionAppliedMessage
		{
			MeetId = "meet123",
			BlockId = blockId,
			ReactionId = 1,
			User = new Participant { Id = participantId, FullName = "Mohammad K", PictureUrl = "Pic" },
			ReactionType = "👍"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AppliedReaction(reaction);

		Assert.Empty(entry.Reactions);
	}

	[Fact]
	public async Task AppliedReaction_WhenReactionExistsAndUserNotInParticipants_ShouldAddUserToReaction()
	{
		var blockId = Guid.NewGuid();
		var existingParticipantId = Guid.NewGuid();
		var newParticipantId = Guid.NewGuid();

		var existingReaction = new AppliedReactions
		{
			ReactionId = 1,
			EntryId = 1,
			Participants =
			[
				new() { Id = existingParticipantId, FullName = "Existing User" }
			]
		};

		var entry = new Entry
		{
			Id = 1,
			BlockId = blockId,
			Content = "Test content",
			ParticipantId = Guid.NewGuid(),
			Reactions = [existingReaction]
		};

		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = [entry],
			Participants = [new ParticipantInMeeting { UserId = newParticipantId }]
		};

		var reaction = new ReactionAppliedMessage
		{
			MeetId = "meet123",
			BlockId = blockId,
			ReactionId = 1,
			User = new Participant { Id = newParticipantId, FullName = "New User" },
			ReactionType = "👍"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AppliedReaction(reaction);

		Assert.Single(entry.Reactions);
		Assert.Equal(2, existingReaction.Participants.Count);
		Assert.Contains(existingReaction.Participants, p => p.Id == existingParticipantId);
		Assert.Contains(existingReaction.Participants, p => p.Id == newParticipantId);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Fact]
	public async Task AppliedReaction_WhenReactionExistsAndUserAlreadyInParticipants_ShouldRemoveUserFromReaction()
	{
		var blockId = Guid.NewGuid();
		var participantId = Guid.NewGuid();

		var existingReaction = new AppliedReactions
		{
			ReactionId = 1,
			EntryId = 1,
			Participants =
			[
				new() { Id = participantId, FullName = "Mohammad K" }
			]
		};

		var entry = new Entry
		{
			Id = 1,
			BlockId = blockId,
			Content = "Test content",
			ParticipantId = Guid.NewGuid(),
			Reactions = [existingReaction]
		};

		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = [entry],
			Participants = [new ParticipantInMeeting { UserId = participantId }]
		};

		var reaction = new ReactionAppliedMessage
		{
			MeetId = "meet123",
			BlockId = blockId,
			ReactionId = 1,
			User = new Participant { Id = participantId, FullName = "Mohammad K" },
			ReactionType = "👍"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);

		await _meetingService.AppliedReaction(reaction);

		Assert.Single(entry.Reactions);
		Assert.Empty(existingReaction.Participants);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), activeMeeting, TimeSpan.FromHours(1)), Times.Once);
	}

	[Theory]
	[InlineData("2025-09-21T10:00:00", "2025-09-21T10:00:02", "00:00:02")]
	[InlineData("2025-09-21T10:00:00", "2025-09-21T10:01:43", "00:01:43")]
	[InlineData("2025-09-21T10:00:00", "2025-09-21T11:43:21", "01:43:21")]
	public async Task CreateEntryFromMessage_Should_CalculateTimelineCorrectly_WhenThereIsNoEntries(string startIso, string nowIso, string expectedTimeline)
	{
		var start = DateTime.Parse(startIso);
		var now = DateTime.Parse(nowIso);

		var activeMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet123",
			Status = MeetingStatus.Recording,
			Entries = [],
			CreatedAt = start
		};

		var entry = new EntryMessage
		{
			MeetId = "meet123",
			BlockId = Guid.NewGuid(),
			Content = "New content",
			Participant = new Participant { Id = Guid.NewGuid(), FullName = "Jane Doe" },
			EntryType = "Transcription"
		};

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(activeMeeting);
		_dateTimeProviderMock.Setup(x => x.Now).Returns(now);

		var result = await _meetingService.UpsertBlock(entry);
		var meeting = await _meetingService.CloseMeeting(entry.MeetId, CancellationToken.None);
		var timeline = meeting.Entries.First().Timeline;
		Assert.Equal(expectedTimeline, timeline);
	}
}
