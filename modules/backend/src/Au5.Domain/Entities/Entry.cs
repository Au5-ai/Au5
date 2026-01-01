using System.ComponentModel.DataAnnotations.Schema;

namespace Au5.Domain.Entities;

[Entity]
public class Entry
{
	public int Id { get; set; }

	public Guid BlockId { get; set; }

	public Guid ParticipantId { get; set; }

	public string FullName { get; set; }

	public string Content { get; set; }

	public DateTime Timestamp { get; set; }

	public string Timeline { get; set; }

	public string EntryType { get; set; }

	public Guid MeetingId { get; set; }

	[ForeignKey(nameof(MeetingId))]
	public Meeting Meeting { get; set; }

	public ICollection<AppliedReactions> Reactions { get; set; }
}
