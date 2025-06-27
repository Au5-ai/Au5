using Au5.Application;
using Au5.Application.Models;
using Au5.Application.Models.Messages;
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
    public void AddUserToMeeting_ShouldNotAddDuplicateUser()
    {
        var userId = Guid.NewGuid();
        var meetingId = Guid.NewGuid().ToString();
        var platform = "Zoom";

        _service.AddUserToMeeting(userId, meetingId, platform);
        _service.AddUserToMeeting(userId, meetingId, platform);

        var meeting = _service.GetFullTranscriptionAsJson(meetingId);
        Assert.Single(meeting.Users.FindAll(u => u == userId));
    }

    [Fact]
    public void EndMeeting_ShouldSetStatusToEnded()
    {
        var userId = Guid.NewGuid();
        var meetingId = Guid.NewGuid().ToString();
        _service.AddUserToMeeting(userId, meetingId, "Teams");

        _service.EndMeeting(meetingId);

        var meeting = _service.GetFullTranscriptionAsJson(meetingId);
        Assert.Equal(MeetingStatus.Ended, meeting.Status);
    }

    [Fact]
    public void AddBot_ShouldReturnFalse_IfMeetingDoesNotExist()
    {
        var request = new RequestToAddBotMessage
        {
            MeetingId = Guid.NewGuid().ToString(),
            BotName = "Bot1",
            User = new UserDto { Id = Guid.NewGuid() }
        };

        var result = _service.AddBot(request);

        Assert.False(result);
    }

    [Fact]
    public void AddParticipantToMeet_ShouldAddParticipants()
    {
        var userId = Guid.NewGuid();
        var meetingId = Guid.NewGuid().ToString();
        _service.AddUserToMeeting(userId, meetingId, "Teams");
        var participants = new List<string> { "user1", "user2" };

        _service.AddParticipantToMeet(participants, meetingId);

        var meeting = _service.GetFullTranscriptionAsJson(meetingId);
        Assert.Contains("user1", meeting.Participants);
        Assert.Contains("user2", meeting.Participants);
    }

    [Fact]
    public void AddUserToMeeting_ShouldAddUser_WhenMeetingDoesNotExist()
    {
        var userId = Guid.NewGuid();
        var meetingId = "m1";

        _service.AddUserToMeeting(userId, meetingId, "Zoom");

        var result = _service.GetFullTranscriptionAsJson(meetingId);

        Assert.NotNull(result);
        Assert.Contains(userId, result.Users);
    }

    [Fact]
    public void AddBot_ShouldSetBotNameAndCreator()
    {
        var meetingId = "m2";
        var userId = Guid.NewGuid();

        _service.AddUserToMeeting(userId, meetingId, "Teams");

        var success = _service.AddBot(new RequestToAddBotMessage
        {
            MeetingId = meetingId,
            BotName = "Bot1",
            User = new UserDto { Id = userId }
        });

        var result = _service.GetFullTranscriptionAsJson(meetingId);

        Assert.True(success);
        Assert.Equal("Bot1", result.BotName);
        Assert.Equal(userId, result.CreatorUserId);
    }

    [Fact]
    public void AddParticipantToMeet_ShouldAddNewParticipantsOnly()
    {
        var meetingId = "m3";
        var userId = Guid.NewGuid();
        _service.AddUserToMeeting(userId, meetingId, "Zoom");

        _service.AddParticipantToMeet(new List<string> { "u1", "u2" }, meetingId);
        _service.AddParticipantToMeet(new List<string> { "u1", "u3" }, meetingId);

        var result = _service.GetFullTranscriptionAsJson(meetingId);

        Assert.Equal(3, result.Participants.Count);
    }

    [Fact]
    public void EndMeeting_ShouldChangeStatusToEnded()
    {
        var meetingId = "m4";
        _service.AddUserToMeeting(Guid.NewGuid(), meetingId, "Zoom");

        _service.EndMeeting(meetingId);

        var result = _service.GetFullTranscriptionAsJson(meetingId);

        Assert.Equal(MeetingStatus.Ended, result.Status);
    }

    [Fact]
    public void BotIsAdded_ShouldMarkBotAsAdded()
    {
        var meetingId = "m5";
        var userId = Guid.NewGuid();

        _service.AddUserToMeeting(userId, meetingId, "Zoom");
        _service.AddBot(new RequestToAddBotMessage
        {
            MeetingId = meetingId,
            BotName = "Bot2",
            User = new UserDto { Id = userId }
        });

        var botName = _service.BotIsAdded(meetingId);

        var result = _service.GetFullTranscriptionAsJson(meetingId);

        Assert.Equal("Bot2", botName);
        Assert.True(result.IsBotAdded);
        Assert.Equal(MeetingStatus.InProgress, result.Status);
    }

    [Fact]
    public void IsPaused_ShouldReturnTrueWhenPaused()
    {
        var meetingId = "m6";
        _service.AddUserToMeeting(Guid.NewGuid(), meetingId, "Zoom");
        _service.PauseMeeting(meetingId, true);

        var paused = _service.IsPaused(meetingId);

        Assert.True(paused);
    }

    [Fact]
    public void UpsertBlock_ShouldInsertOrUpdateEntry()
    {
        var meetingId = "m7";
        var blockId = "b1";
        var userId = Guid.NewGuid();

        _service.AddUserToMeeting(userId, meetingId, "Zoom");

        var entry = new EntryMessage
        {
            MeetingId = meetingId,
            BlockId = blockId,
            Content = "Initial",
            Speaker = new UserDto { Id = userId, FullName = "Test User" },
            Timestamp = DateTime.UtcNow.ToString(),
            EntryType = "Transcription"
        };

        _service.UpsertBlock(entry);

        entry.Content = "Updated";
        _service.UpsertBlock(entry);

        var result = _service.GetFullTranscriptionAsJson(meetingId);
        var updatedEntry = result.Entries.Find(e => e.BlockId == blockId);

        Assert.Equal("Updated", updatedEntry.Content);
    }

    [Fact]
    public void InsertBlock_ShouldAddNewEntry()
    {
        var meetingId = "m8";
        var blockId = "b2";
        var userId = Guid.NewGuid();

        _service.AddUserToMeeting(userId, meetingId, "Zoom");

        var entry = new EntryMessage
        {
            MeetingId = meetingId,
            BlockId = blockId,
            Content = "Text",
            Speaker = new UserDto { Id = userId, FullName = "Tester" },
            Timestamp = DateTime.UtcNow.ToString(),
            EntryType = "Chat"
        };

        _service.InsertBlock(entry);

        var result = _service.GetFullTranscriptionAsJson(meetingId);
        Assert.Single(result.Entries);
    }

    [Fact]
    public void AppliedReaction_ShouldAddAndToggleReaction()
    {
        var meetingId = "m9";
        var blockId = "r1";
        var userId = Guid.NewGuid();

        _service.AddUserToMeeting(userId, meetingId, "Zoom");

        _service.InsertBlock(new EntryMessage
        {
            MeetingId = meetingId,
            BlockId = blockId,
            Content = "Msg",
            Speaker = new UserDto { Id = userId },
            Timestamp = DateTime.UtcNow.ToString(),
            EntryType = "Transcription"
        });

        var reaction = new ReactionAppliedMessage
        {
            MeetingId = meetingId,
            BlockId = blockId,
            ReactionType = "like",
            UserId = userId
        };

        _service.AppliedReaction(reaction);
        _service.AppliedReaction(reaction);

        var result = _service.GetFullTranscriptionAsJson(meetingId);
        var entry = result.Entries.Find(e => e.BlockId == blockId);

        Assert.DoesNotContain(userId, entry.Reactions.Find(r => r.ReactionType == "like").Users);
    }
}