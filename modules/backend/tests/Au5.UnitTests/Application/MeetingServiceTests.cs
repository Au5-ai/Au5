using Au5.Application.Features.Implement;
using Au5.Application.Interfaces;
using Au5.Application.Models.Messages;
using Au5.Domain.Entities;

namespace Au5.UnitTests.Application;
public class MeetingServiceTests
{
	private const string MEETID = "oik-okwe-dew";
	private const string PLATFORM = "Google Meet";
	private readonly Guid _userId = Guid.NewGuid();

	[Fact]
	public async Task Should_NotAddDuplicateUser_When_AddUserToMeetingIsCalledTwiceWithSameUser()
	{
		var service = CreateServiceWithUser();

		service.AddUserToMeeting(new UserJoinedInMeetingMessage()
		{
			User = new Participant() { Id = _userId },
			MeetId = MEETID,
			Platform = PLATFORM
		});

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		var participantList = result.participants.Where(u => u.Id == _userId).ToList();
		Assert.Single(participantList);
	}

	[Fact]
	public async Task Should_SetStatusToEnded_When_EndMeetingIsCalled()
	{
		var service = CreateServiceWithUser();

		service.EndMeeting(MEETID);

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.Equal(MeetingStatus.Ended, result.status);
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
			User = new Participant { FullName = "Mohammad Karimi" }
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
	public async Task Should_AddParticipants_When_AddParticipantToMeetIsCalled(string participantNamesCsv)
	{
		var service = CreateServiceWithUser();

		var names = participantNamesCsv.Split(',');
		var participants = names.Select(name => new Participant { FullName = name }).ToList();
		service.AddParticipantToMeet(participants, MEETID);

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		var participantFullNames = result.participants.Select(x => x.FullName).ToList();

		foreach (var name in names)
		{
			Assert.Contains(name, participantFullNames);
		}
	}

	[Fact]
	public async Task Should_AddUser_When_AddUserToMeetingIsCalledAndMeetingDoesNotExist()
	{
		var service = CreateServiceWithUser();

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.NotNull(result);
		Assert.Contains(_userId, result.participants.Select(x => x.Id));
	}

	[Fact]
	public async Task Should_SetBotNameAndCreator_When_AddBotIsCalled()
	{
		var botName = "Cando";
		var service = CreateServiceWithUser();

		var hash = service.RequestToAddBot(new RequestToAddBotMessage
		{
			MeetId = MEETID,
			BotName = botName,
			User = new Participant { Id = _userId }
		});

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.NotEqual(hash, string.Empty);
		Assert.Equal(botName, result.botName);
		Assert.Equal(_userId, result.creatorUserId);
		Assert.Equal(_userId, result.botInviterUserId);
	}

	[Fact]
	public async Task Should_AddNewParticipantsOnly_When_AddParticipantToMeetIsCalledMultipleTimes()
	{
		var service = CreateServiceWithUser();

		service.AddParticipantToMeet([new Participant() { HasAccount = true, Id = _userId, FullName = "u1" }, new Participant() { FullName = "u2" }], MEETID);
		service.AddParticipantToMeet([new Participant() { HasAccount = true, Id = _userId, FullName = "u1" }, new Participant() { FullName = "u3" }, new Participant() { FullName = "u2" }], MEETID);

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.Equal(3, result.participants.Count);
	}

	[Fact]
	public async Task Should_ChangeStatusToEnded_When_EndMeetingIsCalled()
	{
		var service = CreateServiceWithUser();

		service.EndMeeting(MEETID);

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.Equal(MeetingStatus.Ended, result.status);
	}

	[Fact]
	public async Task Should_MarkBotAsAdded_When_BotIsAddedIsCalled()
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
		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.Equal(botNameFromResponse, botName);
		Assert.True(result.isBotAdded);
		Assert.Equal(MeetingStatus.Recording, result.status);
	}

	[Fact]
	public void Should_ReturnTrue_When_PauseMeetingIsCalledWithTrue()
	{
		var service = CreateServiceWithUser();

		var paused = service.PauseMeeting(MEETID, true);
		Assert.True(paused);
	}

	[Fact]
	public async Task Should_InsertOrUpdateEntry_When_UpsertBlockIsCalled()
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

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		var updatedEntry = result.entries.FirstOrDefault(e => e.blockId == blockId);
		Assert.Equal("Updated", updatedEntry.content);
	}

	[Fact]
	public async Task Should_AddNewEntry_When_InsertBlockIsCalled()
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

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.Single(result.entries);
	}

	[Fact]
	public async Task Should_AddReaction_When_AppliedReactionIsCalledFirstTime()
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

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		var entry = result.entries.FirstOrDefault(e => e.blockId == blockId);
		var addedReaction = entry.reactions.FirstOrDefault(r => r.id == 1);

		Assert.NotNull(addedReaction);
		Assert.Contains(_userId, addedReaction.users);
	}

	[Fact]
	public async Task Should_AddAndToggleReaction_When_AppliedReactionIsCalledTwice()
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

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		var entry = result.entries.FirstOrDefault(e => e.blockId == blockId);
		Assert.DoesNotContain(_userId, entry.reactions.FirstOrDefault(r => r.id == 1).users);
	}

	[Fact]
	public async Task Should_KeepReactionFromSecondUser_When_FirstUserRemovesReaction()
	{
		var service = CreateServiceWithUser(); // assumes _userId is User1
		var user1 = _userId;
		var user2 = Guid.NewGuid(); // Simulate another user

		var blockId = Guid.NewGuid();
		service.InsertBlock(new EntryMessage
		{
			MeetId = MEETID,
			BlockId = blockId,
			Content = "Message",
			Participant = new Participant { Id = user1 },
			Timestamp = DateTime.UtcNow,
			EntryType = "Transcription"
		});

		service.AddUserToMeeting(new UserJoinedInMeetingMessage
		{
			User = new Participant { Id = user2 },
			MeetId = MEETID,
			Platform = PLATFORM
		});

		var reactionFromUser1 = new ReactionAppliedMessage
		{
			ReactionId = 1,
			MeetId = MEETID,
			BlockId = blockId,
			ReactionType = "Like",
			User = new Participant() { Id = user1 }
		};

		var reactionFromUser2 = new ReactionAppliedMessage
		{
			ReactionId = 1,
			MeetId = MEETID,
			BlockId = blockId,
			ReactionType = "Like",
			User = new Participant() { Id = user2 }
		};

		// Both users add the same reaction
		service.AppliedReaction(reactionFromUser1);
		service.AppliedReaction(reactionFromUser2);

		// User1 toggles off their reaction
		service.AppliedReaction(reactionFromUser1);

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		var entry = result.entries.FirstOrDefault(e => e.blockId == blockId);
		var reaction = entry.reactions.FirstOrDefault(r => r.id == 1);

		Assert.NotNull(reaction);
		Assert.DoesNotContain(user1, reaction.users);
		Assert.Contains(user2, reaction.users);
		Assert.Single(reaction.users); // Only user2 should remain
	}

	[Fact]
	public async Task Should_ReturnMeetingWithNormalizedTimestamps_When_GetFullTranscriptionAsJsonIsCalledWithOverTwoHoursAnd100Entries()
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

		var result = (await service.GetFullTranscriptionAsJson(MEETID)).Data;
		Assert.NotNull(result);
		Assert.Equal(totalEntries, result.entries.Count);

		var entries = result.entries.ToList();
		Assert.Equal("00:00:00", entries[0].timeline);
		Assert.Equal("00:12:00", entries[10].timeline);
		Assert.Equal("00:36:00", entries[30].timeline);
		Assert.Equal("01:12:00", entries[60].timeline);
		Assert.Equal("01:58:48", entries[99].timeline);
	}

	private MeetingService CreateServiceWithUser()
	{
		var reactions = new List<Reaction>
		{
			new() { Id = 1, Type = "Like", Emoji = "⚡", ClassName = "reaction-like" },
			new() { Id = 2, Type = "GoodPoint", Emoji = "⭐", ClassName = "reaction-important" },
			new() { Id = 3, Type = "Goal", Emoji = "🎯", ClassName = "reaction-question" }
		};

		var reactionServiceMock = new Mock<IReactionService>();
		reactionServiceMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(reactions);

		var service = new MeetingService(reactionServiceMock.Object);
		service.AddUserToMeeting(new UserJoinedInMeetingMessage
		{
			User = new Participant { Id = _userId },
			MeetId = MEETID,
			Platform = PLATFORM
		});

		return service;
	}
}
