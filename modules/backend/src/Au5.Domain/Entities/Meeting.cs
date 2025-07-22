using System.ComponentModel.DataAnnotations.Schema;

namespace Au5.Domain.Entities;

[Entity]
public class Meeting
{
	public Guid Id { get; set; }

	public string MeetId { get; set; }

	public Guid BotInviterUserId { get; set; }

	[ForeignKey(nameof(BotInviterUserId))]
	public User User { get; set; }

	public string HashToken { get; set; }

	public string Platform { get; set; }

	public string BotName { get; set; }

	public bool IsBotAdded { get; set; }

	public DateTime CreatedAt { get; set; }

	public MeetingStatus Status { get; set; }

	public ICollection<ParticipantInMeeting> Participants { get; set; }

	public ICollection<Entry> Entries { get; set; }

	public bool IsActive()
		=> Status is MeetingStatus.Recording or MeetingStatus.Paused;

	public bool IsPaused()
		=> Status == MeetingStatus.Paused;

	public bool IsRecording()
		=> Status == MeetingStatus.Recording;

	public bool IsEnded()
		=> Status == MeetingStatus.Ended;
}
