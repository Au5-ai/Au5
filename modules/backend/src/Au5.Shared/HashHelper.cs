using System.Security.Cryptography;
using System.Text;

namespace Au5.Shared;

public static class HashHelper
{
	public static string HashPassword(string password, Guid salt)
	{
		var salted = Encoding.UTF8.GetBytes(password + salt);
		var hash = SHA256.HashData(salted);
		return Convert.ToBase64String(hash);
	}

	public static string HashSafe(string data)
	{
		var bytes = Encoding.UTF8.GetBytes(data);
		var hash = SHA256.HashData(bytes);
		return Convert.ToHexString(hash);
	}
}
