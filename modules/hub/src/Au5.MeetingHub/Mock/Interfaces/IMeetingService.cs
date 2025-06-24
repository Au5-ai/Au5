namespace Au5.MeetingHub.Mock.Interfaces;

public interface IMeetingService
{
    void AddUserToMeeting(User user, string meetingId, string platform);
    void EndMeeting(string meetingId);
    void AddParticipantToMeet(List<string> users, string meetingId);
}

