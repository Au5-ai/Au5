using Au5.Application;
using Au5.Application.Models.Messages;

namespace Au5.UnitTests.Application;

public class MeetingServiceTests
{
	private const string MEETID = "oik-okwe-dew";
	private const string PLATFORM = "Google Meet";
	private readonly Guid _userId = Guid.NewGuid();

	[Fact]
	public void Should_NotAddDuplicateUser_When_AddUserToMeetingIsCalledTwiceWithSameUser()
	{
		var service = CreateServiceWithUser();

		service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = _userId },
			MeetId = MEETID,
			Platform = PLATFORM
		});

		var meeting = service.GetFullTranscriptionAsJson(MEETID);
		var participantList = meeting.Participants.Where(u => u.UserId == _userId).ToList();
		Assert.Single(participantList);
	}

	[Fact]
	public void Should_SetStatusToEnded_When_EndMeetingIsCalled()
	{
		var service = CreateServiceWithUser();

		service.EndMeeting(MEETID);

		var meeting = service.GetFullTranscriptionAsJson(MEETID);
		Assert.Equal(MeetingStatus.Ended, meeting.Status);
	}

	[Fact]
	public void Should_ReturnEmptyString_When_AddBotToNonExistentMeeting()
	{
		var service = CreateServiceWithUser();

		var request = new RequestToAddBotMessage
		{
			MeetId = Guid.NewGuid().ToString(),
			BotName = "Bot1",
			User = new Participant { Id = Guid.NewGuid() }
		};

		var result = service.RequestToAddBot(request);

		Assert.Equal(result, string.Empty);
	}

	[Fact]
	public void Should_ReturnEmptyString_When_UserNotInMeetingTriesToAddBot()
	{
		var service = CreateServiceWithUser();

		var request = new RequestToAddBotMessage
		{
			MeetId = Guid.NewGuid().ToString(),
			BotName = "Bot1",
			User = new Participant { Id = Guid.NewGuid() }
		};

		var result = service.RequestToAddBot(request);

		Assert.Equal(result, string.Empty);
	}

	[Fact]
	public void Should_ReturnNonEmptyString_When_UserInMeetingAddsBot()
	{
		var service = CreateServiceWithUser();

		var request = new RequestToAddBotMessage
		{
			MeetId = MEETID,
			BotName = "Bot1",
			User = new Participant { Id = _userId }
		};

		var result = service.RequestToAddBot(request);

		Assert.NotEqual(result, string.Empty);
	}

	[Theory]
	[InlineData("user1,user2")]
	[InlineData("userA,userB,userC")]
	[InlineData("singleUser")]
	public void Should_AddParticipants_When_AddParticipantToMeetIsCalled(string participantNamesCsv)
	{
		var service = CreateServiceWithUser();
		var names = participantNamesCsv.Split(',');

		var participants = names.Select(name => new Participant { FullName = name }).ToList();

		service.AddParticipantToMeet(participants, MEETID);

		var meeting = service.GetFullTranscriptionAsJson(MEETID);
		var participantFullNames = meeting.Participants.Select(x => x.FullName).ToList();

		foreach (var name in names)
		{
			Assert.Contains(name, participantFullNames);
		}
	}

	[Fact]
	public void Should_AddUser_When_AddUserToMeetingIsCalledAndMeetingDoesNotExist()
	{
		var service = CreateServiceWithUser();

		var result = service.GetFullTranscriptionAsJson(MEETID);

		Assert.NotNull(result);
		Assert.Contains(_userId, result.Participants.Select(x => x.UserId));
	}

	[Fact]
	public void Should_SetBotNameAndCreator_When_AddBotIsCalled()
	{
		var botName = "Cando";
		var service = CreateServiceWithUser();

		var hash = service.RequestToAddBot(new RequestToAddBotMessage
		{
			MeetId = MEETID,
			BotName = botName,
			User = new Participant { Id = _userId }
		});

		var result = service.GetFullTranscriptionAsJson(MEETID);

		Assert.NotEqual(hash, string.Empty);
		Assert.Equal(botName, result.BotName);
		Assert.Equal(_userId, result.CreatorUserId);
		Assert.Equal(_userId, result.BotInviterUserId);
	}

	[Fact]
	public void Should_AddNewParticipantsOnly_When_AddParticipantToMeetIsCalledMultipleTimes()
	{
		var service = CreateServiceWithUser();

		service.AddParticipantToMeet([new Participant() { HasAccount = true, Id = _userId, FullName = "u1" }, new Participant() { FullName = "u2" }], MEETID);
		service.AddParticipantToMeet([new Participant() { HasAccount = true, Id = _userId, FullName = "u1" }, new Participant() { FullName = "u3" }, new Participant() { FullName = "u2" }], MEETID);

		var result = service.GetFullTranscriptionAsJson(MEETID);

		Assert.Equal(3, result.Participants.Count);
	}

	[Fact]
	public void Should_ChangeStatusToEnded_When_EndMeetingIsCalled()
	{
		var service = CreateServiceWithUser();

		service.EndMeeting(MEETID);

		var result = service.GetFullTranscriptionAsJson(MEETID);

		Assert.Equal(MeetingStatus.Ended, result.Status);
	}

	[Fact]
	public void Should_MarkBotAsAdded_When_BotIsAddedIsCalled()
	{
		var botName = "Cando";
		var service = CreateServiceWithUser();

		service.RequestToAddBot(new RequestToAddBotMessage
		{
			MeetId = MEETID,
			BotName = botName,
			User = new Participant { Id = _userId }
		});

		var botNameFromResponse = service.BotIsAdded(MEETID);

		var result = service.GetFullTranscriptionAsJson(MEETID);

		Assert.Equal(botNameFromResponse, botName);
		Assert.True(result.IsBotAdded);
		Assert.Equal(MeetingStatus.Recording, result.Status);
	}

	[Fact]
	public void Should_ReturnTrue_When_PauseMeetingIsCalledWithTrue()
	{
		var service = CreateServiceWithUser();

		var paused = service.PauseMeeting(MEETID, true);
		Assert.True(paused);
	}

	[Fact]
	public void Should_InsertOrUpdateEntry_When_UpsertBlockIsCalled()
	{
		var service = CreateServiceWithUser();
		var blockId = Guid.NewGuid();

		var entry = new EntryMessage
		{
			MeetId = MEETID,
			BlockId = blockId,
			Content = "Initial",
			Participant = new Participant { Id = _userId, FullName = "Mohammad Karimi" },
			Timestamp = DateTime.UtcNow,
			EntryType = "Transcription"
		};

		service.UpsertBlock(entry);

		entry.Content = "Updated";
		service.UpsertBlock(entry);

		var result = service.GetFullTranscriptionAsJson(MEETID);
		var updatedEntry = result.Entries.FirstOrDefault(e => e.BlockId == blockId);

		Assert.Equal("Updated", updatedEntry.Content);
	}

	[Fact]
	public void Should_AddNewEntry_When_InsertBlockIsCalled()
	{
		var service = CreateServiceWithUser();
		var blockId = Guid.NewGuid();

		var entry = new EntryMessage
		{
			MeetId = MEETID,
			BlockId = blockId,
			Content = "Text",
			Participant = new Participant { Id = _userId, FullName = "Tester" },
			Timestamp = DateTime.UtcNow,
			EntryType = "Chat"
		};

		service.InsertBlock(entry);

		var result = service.GetFullTranscriptionAsJson(MEETID);
		Assert.Single(result.Entries);
	}

	[Fact]
	public void Should_AddAndToggleReaction_When_AppliedReactionIsCalledTwice()
	{
		var service = CreateServiceWithUser();
		var blockId = Guid.NewGuid();

		service.InsertBlock(new EntryMessage
		{
			MeetId = MEETID,
			BlockId = blockId,
			Content = "Msg",
			Participant = new Participant { Id = _userId },
			Timestamp = DateTime.UtcNow,
			EntryType = "Transcription"
		});

		var reaction = new ReactionAppliedMessage
		{
			ReactionId = 1,
			MeetId = MEETID,
			BlockId = blockId,
			ReactionType = "Like",
			User = new Participant() { Id = _userId }
		};

		service.AppliedReaction(reaction);
		service.AppliedReaction(reaction);

		var result = service.GetFullTranscriptionAsJson(MEETID);
		var entry = result.Entries.FirstOrDefault(e => e.BlockId == blockId);

		Assert.DoesNotContain(_userId, entry.Reactions.FirstOrDefault(r => r.ReactionId == 1).Users);
	}

	[Fact]
	public void Should_ReturnMeetingWithNormalizedTimestamps_When_GetFullTranscriptionAsJsonIsCalledWithOverTwoHoursAnd100Entries()
	{
		var service = CreateServiceWithUser();

		var start = DateTime.Now;
		var totalEntries = 100;
		var intervalSeconds = 2 * 60 * 60 / totalEntries;

		for (var i = 0; i < totalEntries; i++)
		{
			var entry = new EntryMessage
			{
				MeetId = MEETID,
				BlockId = Guid.NewGuid(),
				Content = $"Entry {i + 1}",
				Participant = new Participant { Id = _userId, FullName = "User1" },
				Timestamp = start.AddSeconds(i * intervalSeconds),
				EntryType = "Transcription"
			};

			service.InsertBlock(entry);
		}

		var result = service.GetFullTranscriptionAsJson(MEETID);

		Assert.NotNull(result);
		Assert.Equal(totalEntries, result.Entries.Count);

		var entries = result.Entries.ToList();
		Assert.Equal("00:00:00", entries[0].Timeline);
		Assert.Equal("00:12:00", entries[10].Timeline);
		Assert.Equal("00:36:00", entries[30].Timeline);
		Assert.Equal("01:12:00", entries[60].Timeline);
		Assert.Equal("01:58:48", entries[99].Timeline);
	}

	private MeetingService CreateServiceWithUser()
	{
		var service = new MeetingService();
		service.AddUserToMeeting(new UserJoinedInMeetingMessage
		{
			User = new Participant { Id = _userId },
			MeetId = MEETID,
			Platform = PLATFORM
		});
		return service;
	}
}
