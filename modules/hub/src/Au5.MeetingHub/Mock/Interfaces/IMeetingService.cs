using Au5.MeetingHub.Models.Messages;

namespace Au5.MeetingHub.Mock.Interfaces;

public interface IMeetingService
{
    void AddUserToMeeting(User user, string meetingId, string platform);
    void EndMeeting(string meetingId);
    void AddParticipantToMeet(List<string> users, string meetingId);
    void CreateBot(RequestToAddBotMessage requestToAddBotMessage);
    string BotIsAdded(string meetingId);
    bool IsPaused(string meetingId);
    void PauseMeeting(string meetingId, bool isPause);
}

