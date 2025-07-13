using Au5.Application;
using Au5.Application.Models.Messages;
using Au5.Domain.Common;
using Au5.Domain.Entities;

namespace Au5.UnitTests;
public class MeetingServiceTests
{
	private readonly MeetingService _service;

	public MeetingServiceTests()
	{
		_service = new MeetingService();
	}

	[Fact]
	public void AddUserToMeetingShouldNotAddDuplicateUser()
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

		var meeting = _service.GetFullTranscriptionAsJson(meetId);
		Assert.Single(meeting.Participants.Where(u => u.UserId == userId).ToList());
	}

	[Fact]
	public void EndMeetingShouldSetStatusToEnded()
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

		var meeting = _service.GetFullTranscriptionAsJson(meetId);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
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
	public void AddParticipantToMeetShouldAddParticipants()
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

		var meeting = _service.GetFullTranscriptionAsJson(meetId);
		Assert.Contains("user1", meeting.Participants.Select(x => x.FullName));
		Assert.Contains("user2", meeting.Participants.Select(x => x.FullName));
	}

	[Fact]
	public void AddUserToMeetingShouldAddUserWhenMeetingDoesNotExist()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);

		Assert.NotNull(result);
		Assert.Contains(userId, result.Participants.Select(x => x.UserId));
	}

	[Fact]
	public void AddBotShouldSetBotNameAndCreator()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);

		Assert.NotEqual(hash, string.Empty);
		Assert.Equal("Bot1", result.BotName);
		Assert.Equal(userId, result.CreatorUserId);
		Assert.Equal(userId, result.BotInviterUserId);
	}

	[Fact]
	public void AddParticipantToMeetShouldAddNewParticipantsOnly()
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

		_service.AddParticipantToMeet([new Participant() { FullName = "u1" }, new Participant() { FullName = "u2" }], meetId);
		_service.AddParticipantToMeet([new Participant() { FullName = "u1" }, new Participant() { FullName = "u3" }], meetId);

		var result = _service.GetFullTranscriptionAsJson(meetId);

		Assert.Equal(3, result.Participants.Count);
	}

	[Fact]
	public void EndMeetingShouldChangeStatusToEnded()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);

		Assert.Equal(MeetingStatus.Ended, result.Status);
	}

	[Fact]
	public void BotIsAddedShouldMarkBotAsAdded()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);

		Assert.Equal("Bot2", botName);
		Assert.True(result.IsBotAdded);
		Assert.Equal(MeetingStatus.Recording, result.Status);
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
	public void UpsertBlockShouldInsertOrUpdateEntry()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);
		var updatedEntry = result.Entries.FirstOrDefault(e => e.BlockId == blockId);

		Assert.Equal("Updated", updatedEntry.Content);
	}

	[Fact]
	public void InsertBlockShouldAddNewEntry()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);
		Assert.Single(result.Entries);
	}

	[Fact]
	public void AppliedReactionShouldAddAndToggleReaction()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);
		var entry = result.Entries.FirstOrDefault(e => e.BlockId == blockId);

		Assert.DoesNotContain(userId, entry.Reactions.FirstOrDefault(r => r.ReactionId == 1).Users);
	}

	[Fact]
	public void GetFullTranscriptionAsJsonShouldReturnMeetingWithNormalizedTimestampsOverTwoHoursWith100Entries()
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

		var result = _service.GetFullTranscriptionAsJson(meetId);

		Assert.NotNull(result);
		Assert.Equal(totalEntries, result.Entries.Count);

		var entries = result.Entries.ToList();
		Assert.Equal("00:00:00", entries[0].Timeline);
		Assert.Equal("00:12:00", entries[10].Timeline);
		Assert.Equal("00:36:00", entries[30].Timeline);
		Assert.Equal("01:12:00", entries[60].Timeline);
		Assert.Equal("01:58:48", entries[99].Timeline);
	}
}
