namespace Au5.Application.Services;

public class UrlGenerator : IUrlGenerator
{
	public string GenerateMeetingUrl(string platform, string meetId)
	{
		return platform.ToLowerInvariant() switch
		{
			"googlemeet" => $"https://meet.google.com/{meetId}",
			"zoom" => $"https://zoom.us/j/{meetId}",
			"teams" => $"https://teams.microsoft.com/l/meetup-join/{meetId}",
			_ => throw new NotSupportedException($"Platform '{platform}' is not supported")
		};
	}

	public string GenerateExtensionConfigUrl(string baseUrl, Guid Id, string email)
	{
		return $"{baseUrl}/onboarding?id={Id}&hash={HashHelper.HashSafe(email)}";
	}

	public string GeneratePublicMeetingUrl(string baseUrl, Guid meetingId, string meetId)
	{
		return $"{baseUrl}/public/meeting/{meetingId}/{meetId}";
	}
}
