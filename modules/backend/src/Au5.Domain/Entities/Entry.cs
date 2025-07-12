namespace Au5.Domain.Entities;

[Entity]
public class Entry
{
	public int Id { get; set; }

	public Guid BlockId { get; set; }

	public Guid UserId { get; set; }

	/// <summary>
	/// Add it as Json.
	/// </summary>
	public Participant Participant { get; set; }

	public string Content { get; set; }

	public DateTime Timestamp { get; set; }

	public string Timeline { get; set; }

	public string EntryType { get; set; }

	public ICollection<AppliedReactions> Reactions { get; set; }
}
