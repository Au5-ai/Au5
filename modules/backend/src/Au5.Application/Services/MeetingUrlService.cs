using Au5.Application.Common.Abstractions;

namespace Au5.Application.Services;

public class MeetingUrlService : IMeetingUrlService
{
	public string GetMeetingUrl(string platform, string meetId)
	{
		return platform.ToLowerInvariant() switch
		{
			"googlemeet" => $"https://meet.google.com/{meetId}",
			"zoom" => $"https://zoom.us/j/{meetId}",
			"teams" => $"https://teams.microsoft.com/l/meetup-join/{meetId}",
			_ => throw new NotSupportedException($"Platform '{platform}' is not supported")
		};
	}
}
