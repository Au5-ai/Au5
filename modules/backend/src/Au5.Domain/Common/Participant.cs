namespace Au5.Domain.Common;

public class Participant
{
	public Participant()
	{
	}

	public Participant(Guid id, string fullName, string pictureUrl, bool hasAccount)
	{
		Id = id;
		FullName = fullName;
		PictureUrl = pictureUrl;
		HasAccount = hasAccount;
	}

	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	/// <summary>
	/// Gets or sets a value indicating whether indicates whether the participant has an account in the system.
	/// </summary>
	public bool HasAccount { get; set; }
}
