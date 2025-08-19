namespace Au5.Application.Common.Abstractions;

public interface IMeetingRepository
{
	Task<Meeting> GetMeetingAsync(string meetId, CancellationToken ct = default);

	Task SaveMeetingAsync(Meeting meeting, CancellationToken ct = default);

	Task AddEntryAsync(string meetId, Entry entry, CancellationToken ct = default);

	Task UpdateEntryAsync(string meetId, Entry entry, CancellationToken ct = default);

	Task ApplyReactionAsync(string meetId, Guid blockId, AppliedReactions reaction, CancellationToken ct = default);

	Task EndMeetingAsync(string meetId, CancellationToken ct = default);
}
