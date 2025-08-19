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

	public async Task<Meeting> GetMeetingAsync(string meetId)
	{
		var meeting = await _cache.GetAsync<Meeting>(Key(meetId));
		return meeting is null ? throw new KeyNotFoundException($"Meeting '{meetId}' not found.") : meeting;
	}

	public Task SaveMeetingAsync(Meeting meeting)
		=> _cache.SetAsync(Key(meeting.MeetId), meeting, _defaultExpiration);

	public async Task AddEntryAsync(string meetId, Entry entry)
	{
		var meeting = await GetMeetingAsync(meetId);
		meeting.Entries.Add(entry);
		await SaveMeetingAsync(meeting);
	}

	public async Task UpdateEntryAsync(string meetId, Entry entry)
	{
		var meeting = await GetMeetingAsync(meetId);
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

		await SaveMeetingAsync(meeting);
	}

	public async Task ApplyReactionAsync(string meetId, string blockId, AppliedReactions reaction)
	{
		var meeting = await GetMeetingAsync(meetId);
		var entry = meeting.Entries.FirstOrDefault(e => e.BlockId.ToString() == blockId);
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
				Participants = reaction.Participants?.ToList() ?? new List<Participant>()
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

		await SaveMeetingAsync(meeting);
	}

	public async Task EndMeetingAsync(string meetId)
	{
		var meeting = await GetMeetingAsync(meetId);
		meeting.Status = MeetingStatus.Ended;
		await SaveMeetingAsync(meeting);

		// await _cache.RemoveAsync(Key(meetId));
	}

	private static string Key(string meetId) => $"meeting:{meetId}";
}
