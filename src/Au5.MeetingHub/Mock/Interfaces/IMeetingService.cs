namespace Au5.MeetingHub.Mock.Interfaces;

public interface IMeetingService
{
    void Run(string meetingId, Guid userId);
    bool IsStarted(string meetingId);
}

