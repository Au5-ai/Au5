namespace Au5.Application.Messages;

public class ReactionAppliedMessage : Message
{
	public override string Type => MessageTypesConstants.ReactionApplied;

	public int ReactionId { get; set; }

	public Guid BlockId { get; set; }

	public Participant User { get; set; }

	public string ReactionType { get; set; }
}
