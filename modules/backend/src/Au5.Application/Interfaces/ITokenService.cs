namespace Au5.Application.Interfaces;
using Au5.Application.Models;

public interface ITokenService
{
	string GenerateToken(UserDto user, string role);
}
