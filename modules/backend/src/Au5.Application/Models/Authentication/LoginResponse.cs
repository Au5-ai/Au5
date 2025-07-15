namespace Au5.Application.Models.Authentication;

public record LoginResponse(
	string accessToken,
	string refreshToken,
	ParticipantDto participant
);
