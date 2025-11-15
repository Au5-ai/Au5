namespace Au5.Application.Common.Abstractions;

public interface IMeetingUrlService
{
	string GetMeetingProviderUrl(string platform, string meetId);

	string GeneratePublicMeetingUrl(string baseUrl, Guid meetingId, string meetId);
}
