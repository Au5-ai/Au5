namespace Au5.Application.Interfaces;

public interface ITokenService
{
	string GenerateToken(Participant user, string role);
}
