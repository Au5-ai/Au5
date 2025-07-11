namespace Au5.Application.Interfaces;

public interface IMeetingService
{
	Meeting AddUserToMeeting(UserJoinedInMeetingMessage userJoined);

	void EndMeeting(string meetingId);

	void AddParticipantToMeet(List<Participant> users, string meetingId);

	string BotIsAdded(string meetingId);

	bool PauseMeeting(string meetingId, bool isPause);

	bool UpsertBlock(EntryMessage entry);

	void InsertBlock(EntryMessage entry);

	Meeting GetFullTranscriptionAsJson(string meetingId);

	void AppliedReaction(ReactionAppliedMessage reaction);

	string RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage);
}
