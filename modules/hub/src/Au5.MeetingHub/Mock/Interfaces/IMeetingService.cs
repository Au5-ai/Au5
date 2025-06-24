namespace Au5.MeetingHub.Mock.Interfaces;

public interface IMeetingService
{
    void Run(string meetingId, string platform);
    void AddUserToMeeting(User user, string meetingId, string platform);
    void AddParticipantToMeet(User user, string meetingId, string platform);
}

