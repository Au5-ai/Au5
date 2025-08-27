using Au5.Application.Common.Abstractions;

namespace Au5.Application.Services;

// public class MeetingService(ICacheProvider cacheProvider) : IMeetingService
// {
// private readonly ICacheProvider _cacheProvider = cacheProvider;
// private static readonly Lock LockObject = new();
// private static readonly List<Meeting> _meetings = [];

public void AddGuestsToMeet(List<Participant> users, string meetId)
{
	lock (LockObject)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
		if (meeting is null)
		{
			return;
		}

		foreach (var item in users)
		{
			var existingParticipant = true;

			if (!item.HasAccount && !meeting.Guests.Any(x => x.FullName == item.FullName))
			{
				existingParticipant = false;
			}

			if (!existingParticipant)
			{
				meeting.Guests.Add(new GuestsInMeeting
				{
					MeetingId = meeting.Id,
					FullName = item.HasAccount ? string.Empty : item.FullName,
					PictureUrl = item.HasAccount ? string.Empty : item.PictureUrl
				});
			}
		}
	}
}

// public string BotIsAdded(string meetId)
// {
// var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
// if (meeting is null)
// {
// return string.Empty;
// }

// lock (LockObject)
// {
// if (!meeting.IsBotAdded)
// {
// meeting.BotName = "Cando";
// meeting.IsBotAdded = true;
// meeting.Status = MeetingStatus.Recording;
// }

// return meeting.BotName;
// }
// }

// public bool PauseMeeting(string meetId, bool isPause)
// {
// var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
// if (meeting is null)
// {
// return false;
// }

// meeting.Status = isPause ? MeetingStatus.Paused : MeetingStatus.Recording;
// return true;
// }

// public bool UpsertBlock(EntryMessage entry)
// {
// var meeting = _meetings.FirstOrDefault(m => m.MeetId == entry.MeetId);
// if (meeting is null || meeting.IsPaused())
// {
// return false;
// }

// lock (LockObject)
// {
// var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == entry.BlockId);
// if (entryBlock is not null)
// {
// entryBlock.Content = entry.Content;
// return true;
// }

// meeting.Entries.Add(new Entry()
// {
// BlockId = entry.BlockId,
// Content = entry.Content,
// ParticipantId = entry.Participant.Id,
// FullName = entry.Participant.FullName,
// Timestamp = entry.Timestamp,
// EntryType = entry.EntryType,
// Reactions = [],
// });
// return true;
// }
// }

// public void InsertBlock(EntryMessage entry)
// {
// var meeting = _meetings.FirstOrDefault(m => m.MeetId == entry.MeetId);
// if (meeting is null)
// {
// return;
// }

// lock (LockObject)
// {
// meeting.Entries.Add(new Entry()
// {
// BlockId = entry.BlockId,
// Content = entry.Content,
// ParticipantId = entry.Participant.Id,
// Timestamp = entry.Timestamp,
// EntryType = entry.EntryType,
// Reactions = [],
// });
// }
// }

// public void AppliedReaction(ReactionAppliedMessage reaction)
// {
// var meeting = _meetings.FirstOrDefault(m => m.MeetId == reaction.MeetId);
// if (meeting is null)
// {
// return;
// }

// lock (LockObject)
// {
// var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == reaction.BlockId);
// if (entryBlock is null)
// {
// return;
// }

// var existingReaction = entryBlock.Reactions.FirstOrDefault(r => r.ReactionId == reaction.ReactionId);
// if (existingReaction is null)
// {
// existingReaction = new AppliedReactions
// {
// EntryId = entryBlock.Id,
// ReactionId = reaction.ReactionId,
// Participants = [new Participant() { Id = reaction.User.Id }],
// };
// entryBlock.Reactions.Add(existingReaction);
// return;
// }

// existingReaction.Participants ??= [];

// if (!existingReaction.Participants.Any(u => u.Id == reaction.User.Id))
// {
// existingReaction.Participants.Add(new Participant() { Id = reaction.User.Id });
// }
// else
// {
// existingReaction.Participants.RemoveAll(u => u.Id == reaction.User.Id);
// }
// }
// }
// }
public class MeetingService : IMeetingService
{
	private static readonly SemaphoreSlim _lock = new(1, 1);
	private readonly ICacheProvider _cacheProvider;

	public MeetingService(ICacheProvider cacheProvider)
	{
		_cacheProvider = cacheProvider;
	}

	public async Task<Meeting> AddUserToMeeting(UserJoinedInMeetingMessage userJoined)
	{
		var today = DateTime.UtcNow.Date;
		var cacheKey = GetMeetingKey(userJoined.MeetId, today);

		await _lock.WaitAsync();
		try
		{
			var meeting = await _cacheProvider.GetAsync<Meeting>(cacheKey);
			if (meeting is null || meeting.IsEnded())
			{
				var meetingId = Guid.NewGuid();
				var hashToken = HashHelper.HashSafe(meetingId.ToString());
				meeting = new Meeting
				{
					Id = meetingId,
					MeetId = userJoined.MeetId,
					Entries = [],
					CreatedAt = DateTime.UtcNow,
					Platform = userJoined.Platform,
					Participants = [],
					Guests = [],
					HashToken = hashToken,
					Status = MeetingStatus.AddingBot,
				};
			}

			if (!meeting.Participants.Any(u => u.UserId == userJoined.User.Id))
			{
				meeting.Participants.Add(new ParticipantInMeeting
				{
					UserId = userJoined.User.Id
				});
			}

			await _cacheProvider.SetAsync(cacheKey, meeting, TimeSpan.FromHours(2));

			return meeting;
		}
		finally
		{
			_lock.Release();
		}
	}

	public async Task AddGuestsToMeet(List<Participant> users, string meetId)
	{
		var key = GetMeetingKey(meetId, DateTime.Now.Date);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null || meeting.IsEnded())
		{
			return;
		}

		foreach (var item in users)
		{
			bool existingParticipant = true;

			// Only check duplicate by FullName when the user has no account
			if (!item.HasAccount && !meeting.Guests.Any(x => x.FullName == item.FullName))
			{
				existingParticipant = false;
			}

			if (!existingParticipant)
			{
				meeting.Guests.Add(new GuestsInMeeting
				{
					MeetingId = meeting.Id,
					FullName = item.HasAccount ? string.Empty : item.FullName,
					PictureUrl = item.HasAccount ? string.Empty : item.PictureUrl
				});
			}
		}

		// Save updated meeting back to cache (refresh TTL)
		await _cacheProvider.SetAsync(key, meeting, TimeSpan.FromHours(12));
	}


	public string BotIsAdded(string meetId)
	{
		throw new NotImplementedException();
	}

	public bool PauseMeeting(string meetId, bool isPause)
	{
		throw new NotImplementedException();
	}

	public bool UpsertBlock(EntryMessage entry)
	{
		throw new NotImplementedException();
	}

	public void InsertBlock(EntryMessage entry)
	{
		throw new NotImplementedException();
	}

	public void AppliedReaction(ReactionAppliedMessage reaction)
	{
		throw new NotImplementedException();
	}

	private static string GetMeetingKey(string meetId, DateTime date)
	{
		return $"meeting:{meetId}:{date:yyyyMMdd}";
	}
}
