using Au5.Application.Common.Utils;

namespace Au5.UnitTests.Application.Services;
public class MeetingUrlServiceTests
{
	[Theory]
	[InlineData("googlemeet", "abc-xyz", "https://meet.google.com/abc-xyz")]
	[InlineData("zoom", "123456789", "https://zoom.us/j/123456789")]
	[InlineData("teams", "TID123", "https://teams.microsoft.com/l/meetup-join/TID123")]
	[InlineData("GoogleMeet", "abc-xyz", "https://meet.google.com/abc-xyz")]
	public void GetMeetingUrl_Should_ReturnExpectedUrl_When_PlatformIsSupported(string platform, string meetId, string expectedUrl)
	{
		var result = UrlGenerator.GenerateMeetingUrl(platform, meetId);

		Assert.Equal(expectedUrl, result);
	}

	[Fact]
	public void GetMeetingUrl_Should_ThrowNotSupportedException_When_PlatformIsNotSupported()
	{
		var platform = "skype";
		var meetId = "someId";

		Assert.Throws<NotSupportedException>(() => UrlGenerator.GenerateMeetingUrl(platform, meetId));
	}
}
