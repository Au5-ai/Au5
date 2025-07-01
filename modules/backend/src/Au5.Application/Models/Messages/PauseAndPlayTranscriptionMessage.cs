namespace Au5.Application.Models.Messages;

public class PauseAndPlayTranscriptionMessage : Message
{
	public override string Type => MessageTypes.PauseAndPlayTranscription;
	public UserDto User { get; set; }
	public bool IsPaused { get; set; }
}
