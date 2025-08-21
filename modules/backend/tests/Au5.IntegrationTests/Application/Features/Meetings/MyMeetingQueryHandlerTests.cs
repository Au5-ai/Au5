using Au5.Application.Features.Meetings.MyMeeting;
using Au5.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Au5.IntegrationTests.Application.Features.Meetings;

public class MyMeetingQueryHandlerTests : BaseIntegrationTest
{
	public const string BaseTestFilesPath = "Infrastructure.Persistence.";

	public MyMeetingQueryHandlerTests(IntegrationTestWebApp webApp)
		: base(webApp)
	{
	}

	[Fact]
	public async Task Handle_Should_ReturnMeetings_When_UserIsAvailable()
	{
		var sql = EmbededResources.GetEmbeddedResourceAsString(BaseTestFilesPath + "AddMeetingDataAsSeed.sql");
		sql = sql.Replace("@@Status", ((byte)MeetingStatus.Ended).ToString()).Replace("@@UserId", UserId.ToString());
		DbContext.Database.ExecuteSqlRaw(sql);
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;
		var query = new MyMeetingQuery(MeetingStatus.Ended)
		{
			UserId = userId
		};

		var result = await Mediator.Send(query);
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.NotEmpty(result.Data);

		Assert.Equal("Monday, July 14", result.Data.First().Date);
		Assert.Equal("Sunday, July 13", result.Data.Last().Date);

		foreach (var meeting in result.Data)
		{
			Assert.Contains(meeting.Items, m => m.Participants.Any(p => p.Id == userId));
			foreach (var item in meeting.Items)
			{
				Assert.NotEqual("Archived", item.Status);
			}
		}
	}

	[Fact]
	public async Task Handle_Should_ReturnArchievedMeetings_When_UserIsAvailable()
	{
		var sql = EmbededResources.GetEmbeddedResourceAsString(BaseTestFilesPath + "AddMeetingDataAsSeed.sql");
		sql = sql.Replace("@@Status", ((byte)MeetingStatus.Archived).ToString()).Replace("@@UserId", UserId.ToString());
		DbContext.Database.ExecuteSqlRaw(sql);
		var userId = UserId;
		TestCurrentUserService.UserId = userId;
		TestCurrentUserService.IsAuthenticated = true;
		var query = new MyMeetingQuery(MeetingStatus.Archived)
		{
			UserId = userId
		};

		var result = await Mediator.Send(query);
		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.NotEmpty(result.Data);

		Assert.Equal("Sunday, July 13", result.Data.First().Date);

		foreach (var meeting in result.Data)
		{
			Assert.Contains(meeting.Items, m => m.Participants.Any(p => p.Id == userId));
			foreach (var item in meeting.Items)
			{
				Assert.Equal("Archived", item.Status);
			}
		}
	}
}
