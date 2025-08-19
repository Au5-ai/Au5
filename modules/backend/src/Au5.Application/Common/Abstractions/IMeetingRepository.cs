namespace Au5.Application.Common.Abstractions;

public interface IMeetingRepository
{
	Task<Meeting> GetMeetingAsync(string meetId);

	Task SaveMeetingAsync(Meeting meeting);

	Task AddEntryAsync(string meetId, Entry entry);

	Task UpdateEntryAsync(string meetId, Entry entry);

	Task ApplyReactionAsync(string meetId, string blockId, AppliedReactions reaction);

	Task EndMeetingAsync(string meetId);
}
