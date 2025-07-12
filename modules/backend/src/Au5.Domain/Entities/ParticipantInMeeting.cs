using System.ComponentModel.DataAnnotations.Schema;

namespace Au5.Domain.Entities;

[Entity]
public class ParticipantInMeeting
{
	public int Id { get; set; }

	[ForeignKey(nameof(MeetingId))]
	public Meeting Meeting { get; set; }

	public Guid MeetingId { get; set; }

	public Guid UserId { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }
}
