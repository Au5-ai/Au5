namespace Au5.Domain.Entities;

[Entity]
public class AppliedReactions
{
	public int Id { get; set; }

	public int EntryId { get; set; }

	public int ReactionId { get; set; }

	/// <summary>
	/// List of user IDs who applied this reaction to the entry as Json.
	/// </summary>
	public List<Guid> Users { get; set; }
}
