using Au5.Application.Features.Meetings.GetSystemMeetingUrl;
using Au5.Domain.Common;
using Au5.Domain.Entities;
using Au5.Shared;

namespace Au5.IntegrationTests.Application.Features.Meetings;

public class GetPulicUrlPropertiesTests : BaseIntegrationTest
{
	public GetPulicUrlPropertiesTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Should_Save_And_Read_PublicLinkEnabled_PublicLinkExpiration_Correctly()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "TEST-001";
		DbContext.Set<Meeting>().Add(new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			MeetName = "Test Meeting",
			BotInviterUserId = Guid.NewGuid(),
			ClosedMeetingUserId = Guid.NewGuid(),
			CreatedAt = DateTime.UtcNow,
			ClosedAt = DateTime.UtcNow,
			Status = MeetingStatus.Ended,
		});
		await DbContext.SaveChangesAsync(CancellationToken.None);
		var dataProvider = new SystemDataProvider();

		var query = new GetMeetingUrlCommand(meetingId, 30);
		var result = await Mediator.Send(query);
		var meeting = await DbContext.Set<Meeting>().FindAsync(meetingId);

		Assert.True(result.IsSuccess);
		Assert.NotNull(meeting);
		Assert.True(meeting!.PublicLinkEnabled);
		Assert.NotNull(meeting!.PublicLinkExpiration!);
		Assert.NotNull(meeting!.PublicLinkEnabled!);
		Assert.True(meeting!.PublicLinkExpiration!.Value.Date == dataProvider.Now.AddDays(30).Date);
	}
}
