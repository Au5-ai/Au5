namespace Au5.Application.Interfaces;

public interface ITokenService
{
	string GenerateToken(Guid extensionId, string fullName, string role);
}
