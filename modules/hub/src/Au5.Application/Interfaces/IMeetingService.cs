namespace Au5.Application.Interfaces;

public interface IMeetingService
{
	Meeting AddUserToMeeting(Guid userId, string meetingId, string platform);
	bool AddBot(RequestToAddBotMessage request);
	void EndMeeting(string meetingId);
	void AddParticipantToMeet(List<string> users, string meetingId);
	string BotIsAdded(string meetingId);
	bool PauseMeeting(string meetingId, bool isPause);
	bool UpsertBlock(EntryMessage entry);
	void InsertBlock(EntryMessage entry);
	Meeting GetFullTranscriptionAsJson(string meetingId);
	void AppliedReaction(ReactionAppliedMessage reaction);
}
