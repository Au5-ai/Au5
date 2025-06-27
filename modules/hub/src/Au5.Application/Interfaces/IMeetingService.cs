namespace Au5.Application.Interfaces;

public interface IMeetingService
{
    void AddUserToMeeting(Guid userId, string meetingId, string platform);
    bool AddBot(RequestToAddBotMessage request);
    void EndMeeting(string meetingId);
    void AddParticipantToMeet(List<string> users, string meetingId);
    string BotIsAdded(string meetingId);
    bool IsPaused(string meetingId);
    void PauseMeeting(string meetingId, bool isPause);
    void UpsertBlock(EntryMessage entry);
    void InsertBlock(EntryMessage entry);
    Meeting GetFullTranscriptionAsJson(string meetingId);
    void AppliedReaction(ReactionAppliedMessage reaction);
}
