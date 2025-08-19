using Au5.Application.Common.Abstractions;
using Au5.Domain.Common;
using Au5.Domain.Entities;

namespace Au5.Infrastructure.Persistence;

public class CachedMeetingRepository : IMeetingRepository
{
	private readonly ICacheProvider _cache;
	private readonly TimeSpan _defaultExpiration;

	public CachedMeetingRepository(ICacheProvider cache, TimeSpan? defaultExpiration = null)
	{
		_cache = cache;
		_defaultExpiration = defaultExpiration ?? TimeSpan.FromHours(6);
	}

	public async Task<Meeting> GetMeetingAsync(string meetId, CancellationToken ct = default)
	{
		var meeting = await _cache.GetAsync<Meeting>(Key(meetId), ct);
		return meeting is null ? throw new KeyNotFoundException($"Meeting '{meetId}' not found.") : meeting;
	}

	public Task SaveMeetingAsync(Meeting meeting, CancellationToken ct = default)
		=> _cache.SetAsync(Key(meeting.MeetId), meeting, _defaultExpiration, ct);

	public async Task AddEntryAsync(string meetId, Entry entry, CancellationToken ct = default)
	{
		var meeting = await GetMeetingAsync(meetId, ct);
		meeting.Entries.Add(entry);
		await SaveMeetingAsync(meeting, ct);
	}

	public async Task UpdateEntryAsync(string meetId, Entry entry, CancellationToken ct = default)
	{
		var meeting = await GetMeetingAsync(meetId, ct);
		var existing = meeting.Entries.FirstOrDefault(e => e.BlockId == entry.BlockId);
		if (existing is null)
		{
			// Upsert semantics: add if not exists
			meeting.Entries.Add(entry);
		}
		else
		{
			existing.Content = entry.Content;
			existing.Timestamp = entry.Timestamp;
			existing.EntryType = entry.EntryType;
			existing.ParticipantId = entry.ParticipantId;
			existing.FullName = entry.FullName;

			// Keep existing.Reactions as-is (don’t overwrite unless you intend to)
		}

		await SaveMeetingAsync(meeting, ct);
	}

	public async Task ApplyReactionAsync(string meetId, Guid blockId, AppliedReactions reaction, CancellationToken ct = default)
	{
		var meeting = await GetMeetingAsync(meetId, ct);
		var entry = meeting.Entries.FirstOrDefault(e => e.BlockId == blockId);
		if (entry is null)
		{
			return;
		}

		var existing = entry.Reactions.FirstOrDefault(r => r.ReactionId == reaction.ReactionId);
		if (existing is null)
		{
			// Add new reaction with first participant
			entry.Reactions.Add(new AppliedReactions
			{
				EntryId = entry.Id,
				ReactionId = reaction.ReactionId,
				Participants = reaction.Participants?.ToList() ?? []
			});
		}
		else
		{
			// Toggle the provided participants (add if missing, remove if present)
			existing.Participants ??= [];
			foreach (var p in reaction.Participants ?? Enumerable.Empty<Participant>())
			{
				var found = existing.Participants.FirstOrDefault(x => x.Id == p.Id);
				if (found is null)
				{
					existing.Participants.Add(p);
				}
				else
				{
					existing.Participants.RemoveAll(x => x.Id == p.Id);
				}
			}
		}

		await SaveMeetingAsync(meeting, ct);
	}

	public async Task EndMeetingAsync(string meetId, CancellationToken ct = default)
	{
		var meeting = await GetMeetingAsync(meetId, ct);
		meeting.Status = MeetingStatus.Ended;
		await SaveMeetingAsync(meeting, ct);

		// await _cache.RemoveAsync(Key(meetId));
	}

	private static string Key(string meetId) => $"meeting:{meetId}";
}
