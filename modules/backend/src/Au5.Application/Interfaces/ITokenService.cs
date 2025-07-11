namespace Au5.Application.Interfaces;

public interface ITokenService
{
	string GenerateToken(string username, string role);
}
