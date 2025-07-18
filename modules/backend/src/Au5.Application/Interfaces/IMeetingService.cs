namespace Au5.Application.Interfaces;

public interface IMeetingService
{
	Meeting AddUserToMeeting(UserJoinedInMeetingMessage userJoined);

	void EndMeeting(string meetId);

	void AddParticipantToMeet(List<Participant> users, string meetId);

	string BotIsAdded(string meetId);

	bool PauseMeeting(string meetId, bool isPause);

	bool UpsertBlock(EntryMessage entry);

	void InsertBlock(EntryMessage entry);

	Task<Result<object>> GetFullTranscriptionAsJson(string meetId, CancellationToken ct = default);

	void AppliedReaction(ReactionAppliedMessage reaction);

	string RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage);
}
