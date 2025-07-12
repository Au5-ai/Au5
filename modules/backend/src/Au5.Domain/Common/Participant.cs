namespace Au5.Domain.Common;

public class Participant
{
	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	public bool IsKnownUser { get; set; }
}
