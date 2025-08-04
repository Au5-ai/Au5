namespace Au5.Domain.Entities;

[Entity]
public class User
{
	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	public string Email { get; set; }

	public string Password { get; set; }

	public bool IsActive { get; set; }

	public ICollection<Meeting> Meetings { get; set; }

	public Participant ToParticipant()
	{
		return new Participant()
		{
			Id = Id,
			FullName = FullName,
			PictureUrl = PictureUrl,
			HasAccount = true,
			Email = Email
		};
	}
}
