namespace Au5.Application.Common.Abstractions;

public interface IMeetingService
{
	string GetMeetingKey(string meetId);

	Task<Meeting> AddUserToMeeting(UserJoinedInMeetingMessage userJoined);

	Task AddGuestsToMeet(string meetId, IReadOnlyCollection<Guest> guests);

	Task<bool> BotIsAdded(string meetId, string botName);

	Task<bool> PauseMeeting(string meetId, bool isPause);

	Task<bool> UpsertBlock(EntryMessage entry);

	Task AppliedReaction(ReactionAppliedMessage reaction);

	Task<Meeting> CloseMeeting(string meetId, CancellationToken cancellationToken);
}
