namespace Au5.Application.Common.Abstractions;

public interface IUrlGenerator
{
	string GenerateMeetingUrl(string platform, string meetId);

	string GenerateExtensionConfigUrl(string baseUrl, Guid Id, string email);

	string GeneratePublicMeetingUrl(string baseUrl, Guid meetingId, string meetId);
}
