using System.Security.Cryptography;
using System.Text;

namespace Au5.Application.Common.Utils;

public static class GravatarHelper
{
	public static string GetGravatarHash(string email)
	{
		using var md5 = MD5.Create();
		byte[] inputBytes = Encoding.UTF8.GetBytes(email.Trim().ToLower());
		byte[] hashBytes = md5.ComputeHash(inputBytes);

		return Convert.ToHexString(hashBytes).ToLower();
	}
}
