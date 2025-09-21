namespace Au5.Application.Services;

public class MeetingService : IMeetingService
{
	private const string FallbackBotName = "Au5";
	private static readonly TimeSpan CacheExpiration = TimeSpan.FromHours(1);

	private readonly SemaphoreSlim _lock = new(1, 1);
	private readonly ICacheProvider _cacheProvider;
	private readonly IApplicationDbContext _dbContext;

	public MeetingService(ICacheProvider cacheProvider, IApplicationDbContext dbContext)
	{
		_cacheProvider = cacheProvider ?? throw new ArgumentNullException(nameof(cacheProvider));
		_dbContext = dbContext;
	}

	public static string GetMeetingKey(string meetId)
	{
		var today = DateTime.Now.Date;
		return $"meeting:{meetId}:{today:yyyyMMdd}";
	}

	public async Task<Meeting> AddUserToMeeting(UserJoinedInMeetingMessage userJoined)
	{
		var cacheKey = GetMeetingKey(userJoined.MeetId);

		await _lock.WaitAsync();
		try
		{
			var meeting = await _cacheProvider.GetAsync<Meeting>(cacheKey);

			if (meeting is null || meeting.IsEnded())
			{
				meeting = CreateNewMeeting(userJoined);
			}

			if (!meeting.Participants.Any(u => u.UserId == userJoined.User.Id))
			{
				meeting.Participants.Add(new ParticipantInMeeting
				{
					UserId = userJoined.User.Id
				});
			}

			await _cacheProvider.SetAsync(cacheKey, meeting, CacheExpiration);
			return meeting;
		}
		finally
		{
			_lock.Release();
		}
	}

	public async Task AddGuestsToMeet(List<Participant> users, string meetId)
	{
		var key = GetMeetingKey(meetId);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null || meeting.IsEnded())
		{
			return;
		}

		foreach (var user in users)
		{
			if (!user.HasAccount && !meeting.Guests.Any(g => g.FullName == user.FullName))
			{
				meeting.Guests.Add(new GuestsInMeeting
				{
					MeetingId = meeting.Id,
					FullName = user.FullName,
					PictureUrl = user.PictureUrl
				});
			}
		}

		await _cacheProvider.SetAsync(key, meeting, CacheExpiration);
	}

	public async Task<string> BotIsAdded(string meetId)
	{
		var key = GetMeetingKey(meetId);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null || meeting.IsEnded())
		{
			return string.Empty;
		}

		if (!meeting.IsBotAdded)
		{
			meeting.BotName = await GetBotNameFromConfigAsync();
			meeting.IsBotAdded = true;
			meeting.Status = MeetingStatus.Recording;
		}

		await _cacheProvider.SetAsync(key, meeting, CacheExpiration);
		return meeting.BotName;
	}

	public async Task<bool> PauseMeeting(string meetId, bool isPause)
	{
		var key = GetMeetingKey(meetId);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null || meeting.IsEnded())
		{
			return false;
		}

		meeting.Status = isPause ? MeetingStatus.Paused : MeetingStatus.Recording;
		await _cacheProvider.SetAsync(key, meeting, CacheExpiration);
		return true;
	}

	public async Task<bool> UpsertBlock(EntryMessage entry)
	{
		var key = GetMeetingKey(entry.MeetId);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null || meeting.IsPaused())
		{
			return false;
		}

		await _lock.WaitAsync();
		try
		{
			var existingEntry = meeting.Entries.FirstOrDefault(e => e.BlockId == entry.BlockId);
			if (existingEntry is not null)
			{
				existingEntry.Content = entry.Content;
			}
			else
			{
				meeting.Entries.Add(CreateEntryFromMessage(entry));
			}

			await _cacheProvider.SetAsync(key, meeting, CacheExpiration);
			return true;
		}
		finally
		{
			_lock.Release();
		}
	}

	public async Task AppliedReaction(ReactionAppliedMessage reaction)
	{
		var key = GetMeetingKey(reaction.MeetId);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null)
		{
			return;
		}

		await _lock.WaitAsync();
		try
		{
			var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == reaction.BlockId);
			if (entryBlock is null)
			{
				return;
			}

			var participant = meeting.Participants.FirstOrDefault(x => x.UserId == reaction.User.Id);
			if (participant is null)
			{
				return;
			}

			var existingReaction = entryBlock.Reactions.FirstOrDefault(r => r.ReactionId == reaction.ReactionId);
			if (existingReaction is null)
			{
				existingReaction = new AppliedReactions
				{
					EntryId = entryBlock.Id,
					ReactionId = reaction.ReactionId,
					Participants = [new Participant()
					{
						Id = reaction.User.Id,
						FullName = reaction.User.FullName,
						PictureUrl = reaction.User.PictureUrl
					}

],
				};
				entryBlock.Reactions.Add(existingReaction);
			}
			else
			{
				existingReaction.Participants ??= [];

				if (!existingReaction.Participants.Any(u => u.Id == reaction.User.Id))
				{
					existingReaction.Participants.Add(new Participant()
					{
						Id = reaction.User.Id,
						FullName = reaction.User.FullName,
						PictureUrl = reaction.User.PictureUrl
					});
				}
				else
				{
					existingReaction.Participants.RemoveAll(u => u.Id == reaction.User.Id);
				}
			}

			await _cacheProvider.SetAsync(key, meeting, CacheExpiration);
		}
		finally
		{
			_lock.Release();
		}
	}

	public async Task<Meeting> CloseMeeting(string meetId, CancellationToken cancellationToken)
	{
		var key = GetMeetingKey(meetId);
		var meeting = await _cacheProvider.GetAsync<Meeting>(key);

		if (meeting is null)
		{
			return null;
		}

		await _cacheProvider.RemoveAsync(key);
		return meeting;
	}

	private static Entry CreateEntryFromMessage(EntryMessage entry)
	{
		return new Entry
		{
			BlockId = entry.BlockId,
			Content = entry.Content,
			ParticipantId = entry.Participant.Id,
			FullName = entry.Participant.FullName,
			Timestamp = entry.Timestamp,
			EntryType = entry.EntryType,
			Reactions = [],
		};
	}

	private static Meeting CreateNewMeeting(UserJoinedInMeetingMessage userJoined)
	{
		var meetingId = Guid.NewGuid();
		var hashToken = HashHelper.HashSafe(meetingId.ToString());

		return new Meeting
		{
			Id = meetingId,
			MeetId = userJoined.MeetId,
			Entries = [],
			CreatedAt = DateTime.Now,
			Platform = userJoined.Platform,
			Participants = [],
			Guests = [],
			HashToken = hashToken,
			Status = MeetingStatus.AddingBot,
		};
	}

	private async Task<string> GetBotNameFromConfigAsync(CancellationToken cancellationToken = default)
	{
		var config = await _dbContext.Set<SystemConfig>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		return config?.BotName ?? FallbackBotName;
	}
}
