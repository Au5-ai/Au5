using Au5.MeetingHub.Models.Entity;
using System.Text.Json;

namespace Au5.MeetingHub.Mock;

public class MeetingService : IMeetingService
{
    //private static readonly ConcurrentDictionary<string, Dictionary<string, Entry>> _meetingTranscriptions = new();
    private static readonly Lock _lock = new();
    private static readonly List<Meeting> _meetings = [];

    public void AddUserToMeeting(User user, string meetingId, string platform)
    {
        lock (_lock)
        {
            var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId && m.CreatedAt.Date == DateTime.Now.Date);

            if (meeting is null || (meeting is not null && meeting.Status == MeetingStatus.Ended))
            {
                meeting = new Meeting
                {
                    Id = Guid.NewGuid(),
                    MeetingId = meetingId,
                    Users = [],
                    Entries = [],
                    CreatedAt = DateTime.Now,
                    Platform = platform,
                    Participants = [],
                    Status = MeetingStatus.NotStarted
                };
                _meetings.Add(meeting);
            }

            var existingUser = meeting.Users.Any(u => u == user.Id);
            if (existingUser)
            {
                return;
            }
            meeting.Users.Add(user.Id);
        }
    }
    public bool AddBot(RequestToAddBotMessage request)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == request.MeetingId);
        if (meeting is null)
        {
            return false;
        }
        if (meeting.IsBotAdded)
        {
            return false;
        }
        meeting.BotName = request.BotName;
        meeting.CreatorUserId = request.User.Id;

        return true;
        // Call CLI to create the bot container with the provided name and Configs
    }

    public void AddParticipantToMeet(List<string> users, string meetingId)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return;
        }
        var delta = users.Except(meeting.Participants).ToList();
        if (delta.Count is 0)
        {
            return;
        }
        meeting.Participants.AddRange(delta);
    }

    public void EndMeeting(string meetingId)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return;
        }

        if (meeting.Status == MeetingStatus.Ended)
        {
            return;
        }
        meeting.Status = MeetingStatus.Ended;
    }

    public string BotIsAdded(string meetingId)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return string.Empty;
        }
        if (meeting.IsBotAdded)
        {
            return meeting.BotName;
        }
        lock (_lock)
        {
            meeting.IsBotAdded = true;
            meeting.Status = MeetingStatus.InProgress;
        }
        return meeting.BotName;
    }

    public bool IsPaused(string meetingId)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return true;
        }

        return meeting.Status == MeetingStatus.Paused || meeting.Status == MeetingStatus.Ended;
    }

    public void PauseMeeting(string meetingId, bool isPause)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return;
        }
        if (isPause)
        {
            meeting.Status = MeetingStatus.Paused;
        }
        else
        {
            meeting.Status = MeetingStatus.InProgress;
        }
    }

    public void UpsertBlock(EntryMessage entry)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == entry.MeetingId);
        if (meeting is null)
        {
            return;
        }

        lock (_lock)
        {
            var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == entry.BlockId);
            if (entryBlock is not null)
            {
                entryBlock.Content = entry.Content;
                return;
            }

            meeting.Entries.Add(new Entry()
            {
                MeetingId = entry.MeetingId,
                BlockId = entry.BlockId,
                Content = entry.Content,
                Speaker = entry.Speaker,
                Timestamp = entry.Timestamp,
                EntryType = entry.EntryType,
                Reactions = []
            });
        }
    }

    public void InsertBlock(EntryMessage entry)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == entry.MeetingId);
        if (meeting is null)
        {
            return;
        }
        lock (_lock)
        {
            meeting.Entries.Add(new Entry()
            {
                MeetingId = entry.MeetingId,
                BlockId = entry.BlockId,
                Content = entry.Content,
                Speaker = entry.Speaker,
                Timestamp = entry.Timestamp,
                EntryType = entry.EntryType,
                Reactions = []
            });
        }
    }

    public Meeting GetFullTranscriptionAsJson(string meetingId)
    {
       return _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
    }

    public void AppliedReaction(ReactionAppliedMessage reaction)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == reaction.MeetingId);
        if (meeting is null)
        {
            return;
        }
        lock (_lock)
        {
            var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == reaction.BlockId);
            if (entryBlock is null)
            {
                return;
            }

            var existingReaction = entryBlock.Reactions.FirstOrDefault(r => r.ReactionType == reaction.ReactionType);
            existingReaction.Users ??= [];

            if (!existingReaction.Users.Any(u => u == reaction.UserId))
            {
                existingReaction.Users.Add(reaction.UserId);
            }
            else
            {
                existingReaction.Users.RemoveAll(u => u == reaction.UserId);
            }
        }
    }
}

