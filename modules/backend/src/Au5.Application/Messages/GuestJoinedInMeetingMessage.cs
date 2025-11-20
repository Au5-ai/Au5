namespace Au5.Application.Messages;

public class GuestJoinedInMeetingMessage : Message
{
	public override string Type => MessageTypesConstants.GuestJoinedInMeeting;

	public IReadOnlyCollection<Guest> Guests { get; set; }
}
