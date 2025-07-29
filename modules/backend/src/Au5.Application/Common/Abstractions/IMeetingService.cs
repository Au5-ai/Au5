namespace Au5.Application.Common.Abstractions;

public interface IMeetingService
{
	Meeting AddUserToMeeting(UserJoinedInMeetingMessage userJoined);

	void AddParticipantToMeet(List<Participant> users, string meetId);

	string BotIsAdded(string meetId);

	bool PauseMeeting(string meetId, bool isPause);

	bool UpsertBlock(EntryMessage entry);

	void InsertBlock(EntryMessage entry);

	void AppliedReaction(ReactionAppliedMessage reaction);
}
