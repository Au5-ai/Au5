namespace Au5.Application.Models.Messages;

public class PauseAndPlayTranscriptionMessage : Message
{
	public override string Type => MessageTypesConstants.PauseAndPlayTranscription;

	public Participant User { get; set; }

	public bool IsPaused { get; set; }
}
