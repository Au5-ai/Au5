namespace Au5.Domain.Entities;

[Entity]
public class ParticipantInMeeting
{
	public int Id { get; set; }

	public Guid MeetingId { get; set; }

	public Meeting Meeting { get; set; }

	/// <summary>
	/// Gets or sets the user ID of the participant in the meeting.
	/// It can be optional if the participant does not have an account in the system.
	/// </summary>
	public Guid UserId { get; set; }

	/// <summary>
	/// Gets or sets the user who invited this participant to the meeting.
	/// If the participant does not have an account in the system, this will have value.
	/// </summary>
	public string FullName { get; set; }

	/// <summary>
	/// Gets or sets the user who invited this participant to the meeting.
	/// If the participant does not have an account in the system, this will have value.
	/// </summary>
	public string PictureUrl { get; set; }
}
