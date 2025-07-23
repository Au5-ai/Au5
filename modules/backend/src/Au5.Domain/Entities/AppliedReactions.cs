namespace Au5.Domain.Entities;

[Entity]
public class AppliedReactions
{
	public int Id { get; set; }

	public int EntryId { get; set; }

	public Entry Entry { get; set; }

	public int ReactionId { get; set; }

	public Reaction Reaction { get; set; }

	/// <summary>
	/// Gets or sets list of user IDs who applied this reaction to the entry as Json.
	/// </summary>
	public List<Participant> Participants { get; set; }
}
