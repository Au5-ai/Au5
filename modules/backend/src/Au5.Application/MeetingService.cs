using System.Security.Cryptography;
using System.Text;

namespace Au5.Application;

public class MeetingService : IMeetingService
{
	private static readonly Lock LockObject = new();
	private readonly List<Meeting> _meetings = [];

	public Meeting AddUserToMeeting(UserJoinedInMeetingMessage userJoined)
	{
		lock (LockObject)
		{
			var meeting = _meetings.FirstOrDefault(m => m.MeetId == userJoined.MeetId && m.CreatedAt.Date == DateTime.Now.Date);

			if (meeting is null || (meeting is not null && meeting.IsEnded()))
			{
				meeting = new Meeting
				{
					Id = Guid.NewGuid(),
					MeetId = userJoined.MeetId,
					Entries = [],
					CreatedAt = DateTime.Now,
					Platform = userJoined.Platform,
					Participants = [],
					Status = MeetingStatus.NotStarted,
					CreatorUserId = userJoined.User.Id,
				};
				_meetings.Add(meeting);
			}

			var existingUser = meeting.Participants.Any(u => u.UserId == userJoined.User.Id);
			if (existingUser)
			{
				return meeting;
			}

			meeting.Participants.Add(new ParticipantInMeeting()
			{
				UserId = userJoined.User.Id,
				FullName = userJoined.User.FullName,
				PictureUrl = userJoined.User.PictureUrl,
			});
			return meeting;
		}
	}

	public void AddParticipantToMeet(List<Participant> users, string meetId)
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

				if (!item.HasAccount && !meeting.Participants.Any(x => x.FullName == item.FullName))
				{
					existingParticipant = false;
				}

				if (!existingParticipant)
				{
					meeting.Participants.Add(new ParticipantInMeeting
					{
						MeetingId = meeting.Id,
						FullName = item.HasAccount ? string.Empty : item.FullName,
						PictureUrl = item.HasAccount ? string.Empty : item.PictureUrl
					});
				}
			}
		}
	}

	public void EndMeeting(string meetId)
	{
		lock (LockObject)
		{
			var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
			if (meeting is null || meeting.Status == MeetingStatus.Ended)
			{
				return;
			}

			meeting.Status = MeetingStatus.Ended;
		}
	}

	public string BotIsAdded(string meetId)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
		if (meeting is null)
		{
			return string.Empty;
		}

		lock (LockObject)
		{
			if (!meeting.IsBotAdded)
			{
				meeting.IsBotAdded = true;
				meeting.Status = MeetingStatus.Recording;
			}

			return meeting.BotName;
		}
	}

	public bool PauseMeeting(string meetId, bool isPause)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
		if (meeting is null)
		{
			return false;
		}

		meeting.Status = isPause ? MeetingStatus.Paused : MeetingStatus.Recording;
		return true;
	}

	public bool UpsertBlock(EntryMessage entry)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == entry.MeetId);
		if (meeting is null || meeting.IsPaused())
		{
			return false;
		}

		lock (LockObject)
		{
			var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == entry.BlockId);
			if (entryBlock is not null)
			{
				entryBlock.Content = entry.Content;
				return true;
			}

			meeting.Entries.Add(new Entry()
			{
				BlockId = entry.BlockId,
				Content = entry.Content,
				ParticipantId = entry.Participant.Id,
				FullName = entry.Participant.FullName,
				Timestamp = entry.Timestamp,
				EntryType = entry.EntryType,
				Reactions = [],
			});
			return true;
		}
	}

	public void InsertBlock(EntryMessage entry)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == entry.MeetId);
		if (meeting is null)
		{
			return;
		}

		lock (LockObject)
		{
			meeting.Entries.Add(new Entry()
			{
				BlockId = entry.BlockId,
				Content = entry.Content,
				ParticipantId = entry.Participant.Id,
				Timestamp = entry.Timestamp,
				EntryType = entry.EntryType,
				Reactions = [],
			});
		}
	}

	public Meeting GetFullTranscriptionAsJson(string meetId)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == meetId);
		if (meeting is null || meeting.Entries.Count == 0)
		{
			return meeting;
		}

		var parsedEntries = meeting.Entries
			.Select(e => new
			{
				Entry = e,
				ParsedTimestamp = e.Timestamp,
			})
			.OrderBy(x => x.ParsedTimestamp)
			.ToList();

		if (parsedEntries.Count == 0)
		{
			return meeting;
		}

		var startTime = parsedEntries.First().ParsedTimestamp;

		foreach (var x in parsedEntries)
		{
			var elapsed = x.ParsedTimestamp - startTime;
			x.Entry.Timeline = elapsed.ToString(@"hh\:mm\:ss");
		}

		return meeting;
	}

	public void AppliedReaction(ReactionAppliedMessage reaction)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == reaction.MeetId);
		if (meeting is null)
		{
			return;
		}

		lock (LockObject)
		{
			var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == reaction.BlockId);
			if (entryBlock is null)
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
					Users = [reaction.User.Id],
				};
				entryBlock.Reactions.Add(existingReaction);
				return;
			}

			existingReaction.Users ??= [];

			if (!existingReaction.Users.Any(u => u == reaction.User.Id))
			{
				existingReaction.Users.Add(reaction.User.Id);
			}
			else
			{
				existingReaction.Users.RemoveAll(u => u == reaction.User.Id);
			}
		}
	}

	public string RequestToAddBot(RequestToAddBotMessage requestToAddBotMessage)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetId == requestToAddBotMessage.MeetId);
		if (meeting is null)
		{
			return string.Empty;
		}

		var userFinded = meeting.Participants.Any(u => u.UserId == requestToAddBotMessage.User.Id);
		if (!userFinded)
		{
			return string.Empty;
		}

		if (meeting.IsBotAdded)
		{
			return meeting.HashToken;
		}

		var raw = $"{requestToAddBotMessage.User.Id}{DateTime.Now:O}";
		var bytes = Encoding.UTF8.GetBytes(raw);
		var hash = SHA256.HashData(bytes);
		var hashToken = Convert.ToBase64String(hash);

		meeting.HashToken = hashToken;
		meeting.BotInviterUserId = requestToAddBotMessage.User.Id;
		meeting.BotName = requestToAddBotMessage.BotName;

		return hashToken;
	}
}
