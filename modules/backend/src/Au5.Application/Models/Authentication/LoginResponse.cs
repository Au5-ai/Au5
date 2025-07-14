namespace Au5.Application.Models.Authentication;

public class LoginResponse
{
	public string AccessToken { get; set; }

	public string RefreshToken { get; set; }

	public ParticipantDto Participant { get; set; }
}
