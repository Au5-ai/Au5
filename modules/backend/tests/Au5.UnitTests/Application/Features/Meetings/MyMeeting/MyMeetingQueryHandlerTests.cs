using Au5.Application.Common.Abstractions;
using Au5.Application.Features.Meetings.MyMeeting;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.MyMeeting;

public class MyMeetingQueryHandlerTests
{
	[Fact]
	public async Task Handle_Should_Return_Meetings_For_User()
	{
		var userId = Guid.NewGuid();
		var meetings = GetMeetings(userId);

		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<Meeting>()).Returns(meetings.BuildMockDbSet().Object);

		var handler = new MyMeetingQueryHandler(mockContext.Object);

		var query = new MyMeetingQuery
		{
			UserId = userId
		};

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var meetingResponse = result.Data.First();

		Assert.Equal("Thursday, August 14", meetingResponse.Date);

		var meeting = meetingResponse.Items.First();
		Assert.Equal("meet123", meeting.MeetId);
		Assert.Equal("2:30 PM", meeting.Time);
		Assert.Single(meeting.Participants, p => p == "Mohammad");
		Assert.Equal("Test Meeting", meeting.MeetName);
		Assert.Equal("Google Meet", meeting.Platform);
		Assert.Equal("Bot1", meeting.BotName);
		Assert.Equal("Ended", meeting.Status);
		Assert.Equal("15m", meeting.Duration);
	}

	[Fact]
	public async Task Handle_Should_Return_Empty_When_User_Not_In_Meetings()
	{
		var meetings = GetMeetings(Guid.NewGuid());
		var mockContext = new Mock<IApplicationDbContext>();
		mockContext.Setup(x => x.Set<Meeting>()).Returns(meetings.BuildMockDbSet().Object);

		var handler = new MyMeetingQueryHandler(mockContext.Object);

		var query = new MyMeetingQuery
		{
			UserId = Guid.NewGuid()
		};

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data);
	}

	private List<Meeting> GetMeetings(Guid userId)
	{
		var meetingId = Guid.NewGuid();
		var meetingId2 = Guid.NewGuid();
		var meetings = new List<Meeting>
		{
			new()
			{
				Id = meetingId,
				MeetId = "meet123",
				MeetName = "Test Meeting",
				Platform = "Google Meet",
				BotName = "Bot1",
				CreatedAt = new DateTime(2025, 8, 14, 14, 30, 0),
				Status = MeetingStatus.Ended,
				Duration = "15m",
				Participants =
				[
					new()
					{
						 Id = 1,
						 MeetingId = meetingId,
						 UserId = userId,
						 User = new()
						 {
							 Id = userId,
							 FullName = "Mohammad",
							 PictureUrl = "https://example.com/picture.jpg"
						 }
					},
				],
				Guests = []
			},

			new()
			{
				Id = meetingId2,
				MeetId = "meet999",
				MeetName = "Other Meeting",
				Platform = "Zoom",
				BotName = "Bot2",
				CreatedAt = new DateTime(2025, 8, 14, 10, 0, 0),
				Status = MeetingStatus.Archived,
				Participants =
				[
					new()
					{
						 Id = 1,
						 MeetingId = meetingId,
						 UserId = userId,
						 User = new()
						 {
							 Id = userId,
							 FullName = "Mohammad",
							 PictureUrl = "https://example.com/picture.jpg"
						 }
					},
				],
				Guests = []
			}
		};
		return meetings;
	}
}
