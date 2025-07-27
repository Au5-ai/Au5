using System.Text;

namespace Au5.Shared;

public static class HashHelper
{
	public static string HashPassword(string password, Guid salt)
	{
		var salted = Encoding.UTF8.GetBytes(password + salt);
		var hash = System.Security.Cryptography.SHA256.HashData(salted);
		return Convert.ToBase64String(hash);
	}
}
