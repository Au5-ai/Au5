using Au5.MeetingHub.Mock.Interfaces;
using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub.Mock;

public class MeetingService : IMeetingService
{
    private static readonly List<Meeting> _meetings = [];

    public void Run(string meetingId, string platform)
    {
        if (_meetings.Any(m => m.MeetingId == meetingId))
        {
            return;
        }
        _meetings.Add(new Meeting
        {
            MeetingId = meetingId,
            Users = [],
            Transcriptions = [],
            CreatedAt = DateTime.Now,
            Platform = platform
        });
    }

    public void AddUserToMeeting(User user, string meetingId, string platform)
    {
        var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        Run(meetingId, platform);

        var existingUser = meeting.Users.FirstOrDefault(u => u.Id == user.Id);
        if (existingUser != null)
        {
            return;
        }
        meeting?.Users.Add(user);
    }

    public void AddParticipantToMeet(User user, string meetingId, string platform)
    {
          var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
        Run(meetingId, platform);

        var existingUser = meeting.Participants.FirstOrDefault(u => u == user.FullName);
        if (existingUser != null)
        {
            return;
        }
        meeting?.Participants.Add(user.FullName);
    }
}

