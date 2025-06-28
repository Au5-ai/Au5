using Au5.Application.Interfaces;

namespace Au5.Application;

public class MeetingService : IMeetingService
{
    private static readonly Lock _lock = new();
    private static readonly List<Meeting> _meetings = [];

    public void AddUserToMeeting(Guid userId, string meetingId, string platform)
    {
        lock (_lock)
        {
            var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId && m.CreatedAt.Date == DateTime.Now.Date);

            if (meeting is null || meeting is not null && meeting.IsEnded())
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

            var existingUser = meeting.Users.Any(u => u == userId);
            if (existingUser)
            {
                return;
            }
            meeting.Users.Add(userId);
        }
    }
    public bool AddBot(RequestToAddBotMessage request)
    {
        lock (_lock)
        {
            var meeting = _meetings.FirstOrDefault(m => m.MeetingId == request.MeetingId);
            if (meeting is null || meeting.IsBotAdded)
            {
                return false;
            }
            meeting.BotName = request.BotName;
            meeting.CreatorUserId = request.User.Id;
            // Call CLI to create the bot container with the provided name and Configs
            return true;
        }
    }

    public void AddParticipantToMeet(List<string> users, string meetingId)
    {
        lock (_lock)
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
    }

    public void EndMeeting(string meetingId)
    {
        lock (_lock)
        {
            var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
            if (meeting is null || meeting.Status == MeetingStatus.Ended)
            {
                return;
            }
            meeting.Status = MeetingStatus.Ended;
        }
    }

    public string BotIsAdded(string meetingId)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return string.Empty;
        }

        lock (_lock)
        {
            if (!meeting.IsBotAdded)
            {
                meeting.IsBotAdded = true;
                meeting.Status = MeetingStatus.Recording;
            }
            return meeting.BotName;
        }
    }

    public bool PauseMeeting(string meetingId, bool isPause)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return false;
        }

        meeting.Status = isPause ? MeetingStatus.Paused : MeetingStatus.Recording;
        return true;
    }

    public void UpsertBlock(EntryMessage entry)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == entry.MeetingId);
        if (meeting is null || meeting.IsPaused())
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
                Speaker = entry.Speaker.ToUser(),
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
                Speaker = entry.Speaker.ToUser(),
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
            if (existingReaction is null)
            {
                existingReaction = new Reactions
                {
                    ReactionType = reaction.ReactionType,
                    Users = [reaction.User.Id]
                };
                entryBlock.Reactions.Add(existingReaction);
                return;
            }

            existingReaction.Users ??= [];

            if (!existingReaction.Users.Any(u => u == reaction.User.Id))
            {
                existingReaction.Users.Add(reaction.User.Id);
            }
            else
            {
                existingReaction.Users.RemoveAll(u => u == reaction.User.Id);
            }
        }
    }
}
