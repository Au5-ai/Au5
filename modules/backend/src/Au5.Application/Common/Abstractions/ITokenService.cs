namespace Au5.Application.Common.Abstractions;

public interface ITokenService
{
	string GenerateToken(Guid extensionId, string fullName, string role);
}
