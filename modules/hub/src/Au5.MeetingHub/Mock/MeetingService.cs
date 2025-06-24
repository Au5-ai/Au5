using Au5.MeetingHub.Mock.Interfaces;
using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub.Mock;

public class MeetingService : IMeetingService
{
    private static readonly Lock _lock = new();
    private static readonly List<Meeting> _meetings = [];

    public void AddUserToMeeting(User user, string meetingId, string platform)
    {
        lock (_lock)
        {
            var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId && m.CreatedAt.Date == DateTime.Now.Date);

            if (meeting is not null && meeting.Status == MeetingStatus.Ended)
            {
                _meetings.Add(new Meeting
                {
                    Id = Guid.NewGuid(),
                    MeetingId = meetingId,
                    Users = [],
                    Transcriptions = [],
                    CreatedAt = DateTime.Now,
                    Platform = platform,
                    Participants = [],
                    Status = MeetingStatus.NotStarted
                });
            }

            var existingUser = meeting.Users.Any(u => u == user.Id);
            if (existingUser)
            {
                return;
            }
            meeting?.Users.Add(user.Id);
        }
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

    public void CreateBot(User user, string meetingId, string botName)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        if (meeting is null)
        {
            return;
        }
        if (meeting.IsBotAdded)
        {
            return;
        }
        meeting.BotName = botName;
        meeting.UserAddedBot = user;
        // Call CLI to create the bot container with the provided name and Configs
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
}

