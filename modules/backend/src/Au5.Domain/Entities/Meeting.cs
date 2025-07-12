using System.ComponentModel.DataAnnotations.Schema;
using Au5.Domain.Common;

namespace Au5.Domain.Entities;

[Entity]
public class Meeting
{
	public Guid Id { get; set; }

	public string MeetingId { get; set; }

	public Guid CreatorUserId { get; set; }

	[ForeignKey(nameof(CreatorUserId))]
	public User User { get; set; }

	public Guid BotInviterUserId { get; set; }

	public string HashToken { get; set; }

	public string Platform { get; set; }

	public string BotName { get; set; }

	public bool IsBotAdded { get; set; }

	public DateTime CreatedAt { get; set; }

	public MeetingStatus Status { get; set; }

	public List<Participant> Participants { get; set; }

	public List<Entry> Entries { get; set; }

	public bool IsActive()
		=> Status == MeetingStatus.Recording || Status == MeetingStatus.Paused;

	public bool IsPaused()
		=> Status == MeetingStatus.Paused;

	public bool IsRecording()
		=> Status == MeetingStatus.Recording;

	public bool IsEnded()
		=> Status == MeetingStatus.Ended;
}
