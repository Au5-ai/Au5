namespace Au5.MeetingHub.Mock;

public interface IMeetingService
{
    void Run(string meetingId, Guid userId);
    bool IsStarted(string meetingId);
}

public class MeetingService : IMeetingService
{
    private static readonly Dictionary<string, (bool IsStarted, Guid RunnerUserId)> _meetings = [];

    public bool IsStarted(string meetingId)
    {
        if (_meetings.TryGetValue(meetingId, out var meeting))
        {
            return meeting.IsStarted;
        }
        return false;
    }

    public void Run(string meetingId, Guid userId)
    {
        _meetings.TryAdd(meetingId, (false, userId));
    }
}

