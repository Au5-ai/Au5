namespace Au5.Domain.Common;

public class Participant
{
	public Participant()
	{
	}

	public Participant(Guid id, string fullName, string email, string pictureUrl)
	{
		Id = id;
		FullName = fullName;
		PictureUrl = pictureUrl;
		Email = email;
	}

	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	public string Email { get; set; }
}
