using System.Security.Cryptography;
using System.Text;

namespace Au5.Application.Common.Utils;

public static class GravatarHelper
{
	public static string GetGravatarUrl(string email)
	{
		var normalizedEmail = email.Trim().ToLowerInvariant();
		var emailBytes = Encoding.UTF8.GetBytes(normalizedEmail);

		var hashBytes = MD5.HashData(emailBytes);
		var hash = Convert.ToHexString(hashBytes).ToLowerInvariant();

		return $"https://www.gravatar.com/avatar/{hash}?d=identicon";
	}
}
