using System.Security.Cryptography;
using System.Text;

namespace Au5.Application.Common.Utils;

public static class UrlGenerator
{
	public static string GenerateMeetingUrl(string platform, string meetId)
	{
		return platform.ToLowerInvariant() switch
		{
			"googlemeet" => $"https://meet.google.com/{meetId}",
			"zoom" => $"https://zoom.us/j/{meetId}",
			"teams" => $"https://teams.microsoft.com/l/meetup-join/{meetId}",
			_ => throw new NotSupportedException($"Platform '{platform}' is not supported")
		};
	}

	public static string GenerateExtensionConfigUrl(string baseUrl, Guid Id, string email)
	{
		return $"{baseUrl}/onboarding?id={Id}&hash={HashHelper.HashSafe(email)}";
	}

	public static string GeneratePublicMeetingUrl(string baseUrl, Guid meetingId, string meetId)
	{
		return $"{baseUrl}/public/meeting/{meetingId}/{meetId}";
	}

	public static string GetGravatarUrl(string email)
	{
		var normalizedEmail = email.Trim().ToLowerInvariant();
		var emailBytes = Encoding.UTF8.GetBytes(normalizedEmail);

		var hashBytes = MD5.HashData(emailBytes);
		var hash = Convert.ToHexString(hashBytes).ToLowerInvariant();

		return $"https://www.gravatar.com/avatar/{hash}?d=identicon";
	}
}
