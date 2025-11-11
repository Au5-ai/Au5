using Au5.Application.Services;

namespace Au5.UnitTests.Application.Services;
public class MeetingUrlServiceTests
{
	private readonly MeetingUrlService _service = new();

	[Theory]
	[InlineData("googlemeet", "abc-xyz", "https://meet.google.com/abc-xyz")]
	[InlineData("zoom", "123456789", "https://zoom.us/j/123456789")]
	[InlineData("teams", "TID123", "https://teams.microsoft.com/l/meetup-join/TID123")]
	[InlineData("GoogleMeet", "abc-xyz", "https://meet.google.com/abc-xyz")]
	public void GetMeetingUrl_Should_ReturnExpectedUrl_When_PlatformIsSupported(string platform, string meetId, string expectedUrl)
	{
		var result = _service.GetMeetingProviderUrl(platform, meetId);

		Assert.Equal(expectedUrl, result);
	}

	[Fact]
	public void GetMeetingUrl_Should_ThrowNotSupportedException_When_PlatformIsNotSupported()
	{
		var platform = "skype";
		var meetId = "someId";

		Assert.Throws<NotSupportedException>(() => _service.GetMeetingProviderUrl(platform, meetId));
	}
}
