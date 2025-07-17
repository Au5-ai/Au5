using System.Text.Json.Serialization;

namespace Au5.Domain.Common;

public class Participant
{
	[JsonIgnore]
	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	/// <summary>
	/// Gets or sets a value indicating whether indicates whether the participant has an account in the system.
	/// </summary>
	public bool HasAccount { get; set; }
}
