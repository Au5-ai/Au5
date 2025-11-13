using System.Text.Json.Serialization;

namespace Au5.Domain.Entities;

[Entity]
public class User
{
	public Guid Id { get; set; }

	public string FullName { get; set; }

	public string PictureUrl { get; set; }

	public string Email { get; set; }

	[JsonIgnore]
	public string Password { get; set; }

	public bool IsActive { get; set; }

	public DateTime CreatedAt { get; set; }

	public DateTime? LastLoginAt { get; set; }

	public DateTime? LastPasswordChangeAt { get; set; }

	public RoleTypes Role { get; set; }

	public UserStatus Status { get; set; }

	public string RefreshToken { get; set; } = string.Empty;

	public DateTime? RefreshTokenExpiry { get; set; }

	public ICollection<Meeting> Meetings { get; set; }

	public ICollection<UserSpace> UserSpaces { get; set; }

	public ICollection<MeetingSpace> MeetingSpaces { get; set; }

	public bool IsRegistered()
		=> Status == UserStatus.CompleteSignUp;

	public Participant ToParticipant()
	{
		return new Participant()
		{
			Id = Id,
			FullName = FullName,
			PictureUrl = PictureUrl,
			Email = Email
		};
	}

	public void SetRefreshToken(string token, int expiryDays)
	{
		RefreshToken = token;
		RefreshTokenExpiry = DateTime.UtcNow.AddDays(expiryDays);
	}

	public void RevokeRefreshToken()
	{
		RefreshToken = null;
		RefreshTokenExpiry = null;
	}

	public bool IsRefreshTokenValid(string token)
	{
		return !string.IsNullOrEmpty(RefreshToken) &&
			   RefreshToken == token &&
			   RefreshTokenExpiry.HasValue &&
			   RefreshTokenExpiry > DateTime.UtcNow;
	}
}
