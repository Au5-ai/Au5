using Au5.Application;
using Au5.Application.Interfaces;
using Au5.Application.Models.Messages;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Moq;

namespace Au5.UnitTests.Application;

public class MeetingServiceTests
{
	private readonly MeetingService _service;

	public MeetingServiceTests()
	{
		var reactions = new List<Reaction>
		{
			new() { Id = 1, Type = "Task", Emoji = "⚡", ClassName = "reaction-task" },
			new() { Id = 2, Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important" },
			new() { Id = 3, Type = "Goal", Emoji = "🎯", ClassName = "reaction-question" }
		};

		var reactionServiceMock = new Mock<IReactionService>();
		reactionServiceMock.Setup(r => r.GetAllAsync(default)).ReturnsAsync(reactions);
		_service = new MeetingService(reactionServiceMock.Object);
	}

	[Fact]
	public async Task AddUserToMeetingShouldNotAddDuplicateUser()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});
		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var meetingResult = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = meetingResult.Data!;
		Assert.Single(meeting.participants.Where(u => u.userId == userId).ToList());
	}

	[Fact]
	public async Task EndMeetingShouldSetStatusToEnded()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_ = Guid.NewGuid().ToString();
		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		_service.EndMeeting(meetId);

		var meetingResult = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = meetingResult.Data!;
		Assert.Equal(MeetingStatus.Ended.ToString(), meeting.status);
	}

	[Fact]
	public void AddBotShouldReturnFalseIfMeetingDoesNotExist()
	{
		var request = new RequestToAddBotMessage
		{
			MeetId = Guid.NewGuid().ToString(),
			BotName = "Bot1",
			User = new Participant { Id = Guid.NewGuid() }
		};

		var result = _service.RequestToAddBot(request);

		Assert.Equal(result, string.Empty);
	}

	[Fact]
	public void AddBotShouldReturnFalseIfUserWhoIsNotInMeetingWantsToAddBot()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});
		var request = new RequestToAddBotMessage
		{
			MeetId = Guid.NewGuid().ToString(),
			BotName = "Bot1",
			User = new Participant { Id = Guid.NewGuid() }
		};

		var result = _service.RequestToAddBot(request);

		Assert.Equal(result, string.Empty);
	}

	[Fact]
	public void AddBotShouldReturnFalseIfUserIsInMeeting()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var request = new RequestToAddBotMessage
		{
			MeetId = meetId,
			BotName = "Bot1",
			User = new Participant { Id = userId }
		};

		var result = _service.RequestToAddBot(request);

		Assert.NotEqual(result, string.Empty);
	}

	[Fact]
	public async Task AddParticipantToMeetShouldAddParticipants()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = "platform"
		});
		List<Participant> participants = [new Participant() { FullName = "user1" }, new Participant() { FullName = "user2" }];

		_service.AddParticipantToMeet(participants, meetId);

		var meetingResult = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = meetingResult.Data!;
		Assert.Contains("user1", meeting.participants.Select(x => x.fullName));
		Assert.Contains("user2", meeting.participants.Select(x => x.fullName));
	}

	[Fact]
	public async Task AddUserToMeetingShouldAddUserWhenMeetingDoesNotExist()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;

		Assert.NotNull(meeting);
		Assert.Contains(userId, meeting.participants.Select(x => x.userId));
	}

	[Fact]
	public async Task AddBotShouldSetBotNameAndCreator()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var hash = _service.RequestToAddBot(new RequestToAddBotMessage
		{
			MeetId = meetId,
			BotName = "Bot1",
			User = new Participant { Id = userId }
		});

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;

		Assert.NotEqual(hash, string.Empty);
		Assert.Equal("Bot1", meeting.botName);
		Assert.Equal(userId, meeting.creatorUserId);
		Assert.Equal(userId, meeting.botInviterUserId);
	}

	[Fact]
	public async Task AddParticipantToMeetShouldAddNewParticipantsOnly()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		_service.AddParticipantToMeet([new Participant() { HasAccount = true, Id = userId, FullName = "u1" }, new Participant() { FullName = "u2" }], meetId);
		_service.AddParticipantToMeet([new Participant() { HasAccount = true, Id = userId, FullName = "u1" }, new Participant() { FullName = "u3" }, new Participant() { FullName = "u2" }], meetId);

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;

		Assert.Equal(3, meeting.participants.Count);
	}

	[Fact]
	public async Task EndMeetingShouldChangeStatusToEnded()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		_service.EndMeeting(meetId);

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;

		Assert.Equal(MeetingStatus.Ended.ToString(), meeting.status);
	}

	[Fact]
	public async Task BotIsAddedShouldMarkBotAsAdded()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		_service.RequestToAddBot(new RequestToAddBotMessage
		{
			MeetId = meetId,
			BotName = "Bot2",
			User = new Participant { Id = userId }
		});

		var botName = _service.BotIsAdded(meetId);

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;

		Assert.Equal("Bot2", botName);
		Assert.True(meeting.isBotAdded);
		Assert.Equal(MeetingStatus.Recording.ToString(), meeting.status);
	}

	[Fact]
	public void IsPausedShouldReturnTrueWhenPaused()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var paused = _service.PauseMeeting(meetId, true);

		Assert.True(paused);
	}

	[Fact]
	public async Task UpsertBlockShouldInsertOrUpdateEntry()
	{
		var blockId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var entry = new EntryMessage
		{
			MeetId = meetId,
			BlockId = blockId,
			Content = "Initial",
			Participant = new Participant { Id = userId, FullName = "Test User" },
			Timestamp = DateTime.UtcNow,
			EntryType = "Transcription"
		};

		_service.UpsertBlock(entry);

		entry.Content = "Updated";
		_service.UpsertBlock(entry);

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;
		var updatedEntry = meeting.entries.FirstOrDefault(e => e.blockId == blockId);

		Assert.Equal("Updated", updatedEntry.content);
	}

	[Fact]
	public async Task InsertBlockShouldAddNewEntry()
	{
		var blockId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var entry = new EntryMessage
		{
			MeetId = meetId,
			BlockId = blockId,
			Content = "Text",
			Participant = new Participant { Id = userId, FullName = "Tester" },
			Timestamp = DateTime.UtcNow,
			EntryType = "Chat"
		};

		_service.InsertBlock(entry);

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;
		Assert.Single(meeting.entries);
	}

	[Fact]
	public async Task AppliedReactionShouldAddAndToggleReaction()
	{
		var blockId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		_service.InsertBlock(new EntryMessage
		{
			MeetId = meetId,
			BlockId = blockId,
			Content = "Msg",
			Participant = new Participant { Id = userId },
			Timestamp = DateTime.UtcNow,
			EntryType = "Transcription"
		});

		var reaction = new ReactionAppliedMessage
		{
			ReactionId = 1,
			MeetId = meetId,
			BlockId = blockId,
			ReactionType = "like",
			User = new Participant() { Id = userId }
		};

		_service.AppliedReaction(reaction);
		_service.AppliedReaction(reaction);

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data!;
		var entry = meeting.entries.FirstOrDefault(e => e.blockId == blockId);

		Assert.DoesNotContain(userId, entry.reactions.FirstOrDefault(r => r.id == 1).users);
	}

	[Fact]
	public async Task GetFullTranscriptionAsJsonShouldReturnMeetingWithNormalizedTimestampsOverTwoHoursWith100Entries()
	{
		var userId = Guid.NewGuid();
		var meetId = Guid.NewGuid().ToString();
		var platform = "Zoom";

		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = userId },
			MeetId = meetId,
			Platform = platform
		});

		var start = DateTime.Now;
		var totalEntries = 100;
		var intervalSeconds = 2 * 60 * 60 / totalEntries;

		for (var i = 0; i < totalEntries; i++)
		{
			var entry = new EntryMessage
			{
				MeetId = meetId,
				BlockId = Guid.NewGuid(),
				Content = $"Entry {i + 1}",
				Participant = new Participant { Id = userId, FullName = "User1" },
				Timestamp = start.AddSeconds(i * intervalSeconds),
				EntryType = "Transcription"
			};

			_service.InsertBlock(entry);
		}

		var result = await _service.GetFullTranscriptionAsJson(meetId);
		var meeting = result.Data;

		Assert.NotNull(meeting);
		Assert.Equal(totalEntries, meeting.entries.Count);

		var entries = meeting.entries.ToList();
		Assert.Equal("00:00:00", entries[0].timeline);
		Assert.Equal("00:12:00", entries[10].timeline);
		Assert.Equal("00:36:00", entries[30].timeline);
		Assert.Equal("01:12:00", entries[60].timeline);
		Assert.Equal("01:58:48", entries[99].timeline);
	}
}
