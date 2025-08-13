namespace Au5.Application.Common.Abstractions;

public interface IMeetingUrlService
{
	string GetMeetingUrl(string platform, string meetId);
}
