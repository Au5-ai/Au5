namespace Au5.MeetingHub.Mock.Interfaces;

public interface IMeetingService
{
    void AddUserToMeeting(User user, string meetingId, string platform);
    bool AddBot(RequestToAddBotMessage requestToAddBotMessage);
    void EndMeeting(string meetingId);
    void AddParticipantToMeet(List<string> users, string meetingId);
    string BotIsAdded(string meetingId);
    bool IsPaused(string meetingId);
    void PauseMeeting(string meetingId, bool isPause);
}
