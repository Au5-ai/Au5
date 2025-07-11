using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

namespace Au5.Application;

public class MeetingService : IMeetingService
{
	private static readonly Lock _lock = new();
	private static readonly List<Meeting> _meetings = [];

	public Meeting AddUserToMeeting(UserJoinedInMeetingMessage msg)
	{
		lock (_lock)
		{
			var meeting = _meetings.FirstOrDefault(m => m.MeetingId == msg.MeetingId && m.CreatedAt.Date == DateTime.Now.Date);

			if (meeting is null || (meeting is not null && meeting.IsEnded()))
			{
				meeting = new Meeting
				{
					Id = Guid.NewGuid(),
					MeetingId = msg.MeetingId,
					Users = [],
					Entries = [],
					CreatedAt = DateTime.Now,
					Platform = msg.Platform,
					Participants = [],
					Status = MeetingStatus.NotStarted,
					CreatorUserId = msg.User.Id,
				};
				_meetings.Add(meeting);
			}

			var existingUser = meeting.Users.Any(u => u.Id == msg.User.Id);
			if (existingUser)
			{
				return meeting;
			}

			meeting.Users.Add(new User()
			{
				Id = msg.User.Id
			});
			return meeting;
		}
	}

	public void AddParticipantToMeet(List<Participant> users, string meetingId)
	{
		lock (_lock)
		{
			var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
			if (meeting is null)
			{
				return;
			}

			var delta = users.Except(meeting.Participants).ToList();
			if (delta.Count is 0)
			{
				return;
			}

			meeting.Participants.AddRange(delta);
		}
	}

	public void EndMeeting(string meetingId)
	{
		lock (_lock)
		{
			var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
			if (meeting is null || meeting.Status == MeetingStatus.Ended)
			{
				return;
			}

			meeting.Status = MeetingStatus.Ended;
		}
	}

	public string BotIsAdded(string meetingId)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
		if (meeting is null)
		{
			return string.Empty;
		}

		lock (_lock)
		{
			if (!meeting.IsBotAdded)
			{
				meeting.IsBotAdded = true;
				meeting.Status = MeetingStatus.Recording;
			}

			return meeting.BotName;
		}
	}

	public bool PauseMeeting(string meetingId, bool isPause)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
		if (meeting is null)
		{
			return false;
		}

		meeting.Status = isPause ? MeetingStatus.Paused : MeetingStatus.Recording;
		return true;
	}

	public bool UpsertBlock(EntryMessage entry)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == entry.MeetingId);
		if (meeting is null || meeting.IsPaused())
		{
			return false;
		}

		lock (_lock)
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
				Participant = entry.Participant,
				Timestamp = entry.Timestamp,
				EntryType = entry.EntryType,
				Reactions = []
			});
			return true;
		}
	}

	public void InsertBlock(EntryMessage entry)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == entry.MeetingId);
		if (meeting is null)
		{
			return;
		}

		lock (_lock)
		{
			meeting.Entries.Add(new Entry()
			{
				BlockId = entry.BlockId,
				Content = entry.Content,
				Participant = entry.Participant,
				Timestamp = entry.Timestamp,
				EntryType = entry.EntryType,
				Reactions = []
			});
		}
	}

	public Meeting GetFullTranscriptionAsJson(string meetingId)
	{
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == meetingId);
		if (meeting is null || meeting.Entries.Count == 0)
		{
			return meeting;
		}

		var parsedEntries = meeting.Entries
			.Select(e => new
			{
				Entry = e,
				ParsedTimestamp = e.Timestamp
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
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == reaction.MeetingId);
		if (meeting is null)
		{
			return;
		}

		lock (_lock)
		{
			var entryBlock = meeting.Entries.FirstOrDefault(e => e.BlockId == reaction.BlockId);
			if (entryBlock is null)
			{
				return;
			}

			var existingReaction = entryBlock.Reactions.FirstOrDefault(r => r.Id == reaction.ReactionId);
			if (existingReaction is null)
			{
				existingReaction = new AppliedReactions
				{
					EntryId = entryBlock.Id,
					ReactionId = reaction.ReactionId,
					Users = [reaction.User.Id]
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
		var meeting = _meetings.FirstOrDefault(m => m.MeetingId == requestToAddBotMessage.MeetingId);
		if (meeting is null)
		{
			return string.Empty;
		}

		var userFinded = meeting.Users.Any(u => u.Id == requestToAddBotMessage.User.Id);
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
