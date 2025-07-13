//using Au5.Application;
//using Au5.Application.Models;
//using Au5.Application.Models.Messages;
//using Au5.Domain.Common;

//namespace Au5.UnitTests;
//public class MeetingServiceTests
//{
//	private readonly MeetingService _service;

//	public MeetingServiceTests()
//	{
//		_service = new MeetingService();
//	}

//	[Fact]
//	public void AddUserToMeeting_ShouldNotAddDuplicateUser()
//	{
//		var userId = Guid.NewGuid();
//		var meetId = Guid.NewGuid().ToString();
//		var platform = "Zoom";

//		_service.AddUserToMeeting( userId, meetId, platform);
//		_service.AddUserToMeeting(userId, meetId, platform);

//		var meeting = _service.GetFullTranscriptionAsJson(meetimeetIdngId);
//		Assert.Single(meeting.Users.FindAll(u => u == userId));
//	}

//	[Fact]
//	public void EndMeeting_ShouldSetStatusToEnded()
//	{
//		var userId = Guid.NewGuid();
//		var MeetId = Guid.NewGuid().ToString();
//		_service.AddUserToMeeting(userId, meetingId, "Teams");

//		_service.EndMeeting(meetingId);

//		var meeting = _service.GetFullTranscriptionAsJson(meetingId);
//		Assert.Equal(MeetingStatus.Ended, meeting.Status);
//	}

//	[Fact]
//	public void AddBot_ShouldReturnFalse_IfMeetingDoesNotExist()
//	{
//		var request = new RequestToAddBotMessage
//		{
//			MeetId = Guid.NewGuid().ToString(),
//			BotName = "Bot1",
//			User = new Participant { Id = Guid.NewGuid() }
//		};

//		var result = _service.RequestToAddBot(request);

//		Assert.Equal(result, string.Empty);
//	}

//	[Fact]
//	public void AddBot_ShouldReturnFalse_IfUserWhoIsNotInMeeting_WantsToAddBot()
//	{
//		var userId = Guid.NewGuid();
//		var MeetId = Guid.NewGuid().ToString();
//		var platform = "Zoom";

//		_service.AddUserToMeeting(userId, meetingId, platform);
//		var request = new RequestToAddBotMessage
//		{
//			MeetId = Guid.NewGuid().ToString(),
//			BotName = "Bot1",
//			User = new Participant { Id = Guid.NewGuid() }
//		};

//		var result = _service.RequestToAddBot(request);

//		Assert.Equal(result, string.Empty);
//	}

//	[Fact]
//	public void AddBot_ShouldReturnFalse_IfUserIsInMeeting()
//	{
//		var userId = Guid.NewGuid();
//		var MeetId = Guid.NewGuid().ToString();
//		var platform = "Zoom";

//		_service.AddUserToMeeting(userId, meetingId, platform);
//		var request = new RequestToAddBotMessage
//		{
//			MeetId = meetingId,
//			BotName = "Bot1",
//			User = new Participant { Id = userId }
//		};

//		var result = _service.RequestToAddBot(request);

//		Assert.NotEqual(result, string.Empty);
//	}

//	[Fact]
//	public void AddParticipantToMeet_ShouldAddParticipants()
//	{
//		var userId = Guid.NewGuid();
//		var MeetId = Guid.NewGuid().ToString();
//		_service.AddUserToMeeting(userId, meetingId, "Teams");
//		var participants = new List<string> { "user1", "user2" };

//		_service.AddParticipantToMeet(participants, meetingId);

//		var meeting = _service.GetFullTranscriptionAsJson(meetingId);
//		Assert.Contains("user1", meeting.Participants);
//		Assert.Contains("user2", meeting.Participants);
//	}

//	[Fact]
//	public void AddUserToMeeting_ShouldAddUser_WhenMeetingDoesNotExist()
//	{
//		var userId = Guid.NewGuid();
//		var MeetId = "m1";

//		_service.AddUserToMeeting(userId, meetingId, "Zoom");

//		var result = _service.GetFullTranscriptionAsJson(meetingId);

//		Assert.NotNull(result);
//		Assert.Contains(userId, result.Users);
//	}

//	[Fact]
//	public void AddBot_ShouldSetBotNameAndCreator()
//	{
//		var MeetId = "m2";
//		var userId = Guid.NewGuid();

//		_service.AddUserToMeeting(userId, meetingId, "Teams");

//		var hash = _service.RequestToAddBot(new RequestToAddBotMessage
//		{
//			MeetId = meetingId,
//			BotName = "Bot1",
//			User = new Participant { Id = userId }
//		});

//		var result = _service.GetFullTranscriptionAsJson(meetingId);

//		Assert.NotEqual(hash, string.Empty);
//		Assert.Equal("Bot1", result.BotName);
//		Assert.Equal(userId, result.CreatorUserId);
//		Assert.Equal(userId, result.BotInviterUserId);
//	}

//	[Fact]
//	public void AddParticipantToMeet_ShouldAddNewParticipantsOnly()
//	{
//		var MeetId = "m3";
//		var userId = Guid.NewGuid();
//		_service.AddUserToMeeting(userId, meetingId, "Zoom");

//		_service.AddParticipantToMeet(new List<string> { "u1", "u2" }, meetingId);
//		_service.AddParticipantToMeet(new List<string> { "u1", "u3" }, meetingId);

//		var result = _service.GetFullTranscriptionAsJson(meetingId);

//		Assert.Equal(3, result.Participants.Count);
//	}

//	[Fact]
//	public void EndMeeting_ShouldChangeStatusToEnded()
//	{
//		var MeetId = "m4";
//		_service.AddUserToMeeting(Guid.NewGuid(), meetingId, "Zoom");

//		_service.EndMeeting(meetingId);

//		var result = _service.GetFullTranscriptionAsJson(meetingId);

//		Assert.Equal(MeetingStatus.Ended, result.Status);
//	}

//	[Fact]
//	public void BotIsAdded_ShouldMarkBotAsAdded()
//	{
//		var MeetId = "m5";
//		var userId = Guid.NewGuid();

//		_service.AddUserToMeeting(userId, meetingId, "Zoom");
//		_service.RequestToAddBot(new RequestToAddBotMessage
//		{
//			MeetId = meetingId,
//			BotName = "Bot2",
//			User = new Participant { Id = userId }
//		});

//		var botName = _service.BotIsAdded(meetingId);

//		var result = _service.GetFullTranscriptionAsJson(meetingId);

//		Assert.Equal("Bot2", botName);
//		Assert.True(result.IsBotAdded);
//		Assert.Equal(MeetingStatus.Recording, result.Status);
//	}

//	[Fact]
//	public void IsPaused_ShouldReturnTrueWhenPaused()
//	{
//		var MeetId = "m6";
//		_service.AddUserToMeeting(Guid.NewGuid(), meetingId, "Zoom");
//		var paused = _service.PauseMeeting(meetingId, true);

//		Assert.True(paused);
//	}

//	[Fact]
//	public void UpsertBlock_ShouldInsertOrUpdateEntry()
//	{
//		var MeetId = "m7";
//		var blockId = "b1";
//		var userId = Guid.NewGuid();

//		_service.AddUserToMeeting(userId, meetingId, "Zoom");

//		var entry = new EntryMessage
//		{
//			MeetId = meetingId,
//			BlockId = blockId,
//			Content = "Initial",
//			Participant = new Participant { Id = userId, FullName = "Test User" },
//			Timestamp = DateTime.UtcNow,
//			EntryType = "Transcription"
//		};

//		_service.UpsertBlock(entry);

//		entry.Content = "Updated";
//		_service.UpsertBlock(entry);

//		var result = _service.GetFullTranscriptionAsJson(meetingId);
//		var updatedEntry = result.Entries.Find(e => e.BlockId == blockId);

//		Assert.Equal("Updated", updatedEntry.Content);
//	}

//	[Fact]
//	public void InsertBlock_ShouldAddNewEntry()
//	{
//		var MeetId = "m8";
//		var blockId = "b2";
//		var userId = Guid.NewGuid();

//		_service.AddUserToMeeting(userId, meetingId, "Zoom");

//		var entry = new EntryMessage
//		{
//			MeetId = meetingId,
//			BlockId = blockId,
//			Content = "Text",
//			Participant = new Participant { Id = userId, FullName = "Tester" },
//			Timestamp = DateTime.UtcNow,
//			EntryType = "Chat"
//		};

//		_service.InsertBlock(entry);

//		var result = _service.GetFullTranscriptionAsJson(meetingId);
//		Assert.Single(result.Entries);
//	}

//	[Fact]
//	public void AppliedReaction_ShouldAddAndToggleReaction()
//	{
//		var MeetId = "m9";
//		var blockId = Guid.NewGuid();
//		var userId = Guid.NewGuid();

//		_service.AddUserToMeeting(new UserJoinedInMeetingMessage()
//		{
//			User = new Participant() { Id = userId },
//			MeetId = meetingId,
//			Platform = "Zoom",
//		});

//		_service.InsertBlock(new EntryMessage
//		{
//			MeetId = meetingId,
//			BlockId = blockId,
//			Content = "Msg",
//			Participant = new Participant { Id = userId },
//			Timestamp = DateTime.UtcNow,
//			EntryType = "Transcription"
//		});

//		var reaction = new ReactionAppliedMessage
//		{
//			ReactionId = 1,
//			MeetId = meetingId,
//			BlockId = blockId,
//			ReactionType = "like",
//			User = new Participant() { Id = userId }
//		};

//		_service.AppliedReaction(reaction);
//		_service.AppliedReaction(reaction);

//		var result = _service.GetFullTranscriptionAsJson(meetingId);
//		var entry = result.Entries.Find(e => e.BlockId == blockId);

//		Assert.DoesNotContain(userId, entry.Reactions.FirstOrDefault(r => r.ReactionId == 1).Users);
//	}

//	[Fact]
//	public void GetFullTranscriptionAsJson_ShouldReturnMeetingWithNormalizedTimestamps_OverTwoHoursWith100Entries()
//	{
//		var MeetId = "transcriptionTest2Hours100Entries";
//		var userId = Guid.NewGuid();
//		_service.AddUserToMeeting(userId, meetingId, "GoogleMeet");

//		var start = DateTime.Now;
//		var totalEntries = 100;
//		var intervalSeconds = (2 * 60 * 60) / totalEntries;

//		for (int i = 0; i < totalEntries; i++)
//		{
//			var entry = new EntryMessage
//			{
//				MeetId = meetingId,
//				BlockId = $"block{i + 1}",
//				Content = $"Entry {i + 1}",
//				Participant = new Participant { Id = userId, FullName = "User1" },
//				Timestamp = start.AddSeconds(i * intervalSeconds),
//				EntryType = "Transcription"
//			};

//			_service.InsertBlock(entry);
//		}

//		var result = _service.GetFullTranscriptionAsJson(meetingId);

//		Assert.NotNull(result);
//		Assert.Equal(totalEntries, result.Entries.Count);

//		// Check some expected normalized timestamps
//		Assert.Equal("00:00:00", result.Entries[0].Timeline);
//		Assert.Equal("00:12:00", result.Entries[10].Timeline);
//		Assert.Equal("00:36:00", result.Entries[30].Timeline);
//		Assert.Equal("01:12:00", result.Entries[60].Timeline);
//		Assert.Equal("01:58:48", result.Entries[99].Timeline);
//	}
//}
