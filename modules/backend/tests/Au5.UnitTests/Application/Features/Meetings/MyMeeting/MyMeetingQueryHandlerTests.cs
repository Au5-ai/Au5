using Au5.Application.Features.Meetings.MyMeeting;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.MyMeeting;

public class MyMeetingQueryHandlerTests
{
	[Theory]
	[InlineData(MeetingStatus.Ended, "meet123")]
	[InlineData(MeetingStatus.AddingBot, "meet123")]
	[InlineData(MeetingStatus.Recording, "meet123")]
	[InlineData(MeetingStatus.Paused, "meet123")]
	[InlineData(MeetingStatus.Archived, "meet999")]
	public async Task Handle_Should_Return_Meetings_For_User(MeetingStatus status, string meetId)
	{
		var userId = Guid.NewGuid();
		var meetings = GetMeetings(userId);

		var mockContext = new Mock<IApplicationDbContext>();
		var currentUserService = new Mock<ICurrentUserService>();

		currentUserService.Setup(x => x.UserId).Returns(userId);
		mockContext.Setup(x => x.Set<Meeting>()).Returns(meetings.BuildMockDbSet().Object);

		var handler = new MyMeetingQueryHandler(mockContext.Object, currentUserService.Object);

		var query = new MyMeetingQuery(status);

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Single(result.Data);

		var meetingResponse = result.Data.First();

		var meeting = meetingResponse.Items[0];
		Assert.Equal(meetId, meeting.MeetId);
	}

	[Fact]
	public async Task Handle_Should_Return_Meetings_For_Different_Date()
	{
		var userId = Guid.NewGuid();
		var meetings = GetMultipleMeetings(userId);

		var mockContext = new Mock<IApplicationDbContext>();
		var currentUserService = new Mock<ICurrentUserService>();

		currentUserService.Setup(x => x.UserId).Returns(userId);
		mockContext.Setup(x => x.Set<Meeting>()).Returns(meetings.BuildMockDbSet().Object);

		var handler = new MyMeetingQueryHandler(mockContext.Object, currentUserService.Object);

		var query = new MyMeetingQuery(MeetingStatus.Ended);

		var result = await handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal(2, result.Data.Count);

		Assert.Equal("Friday, August 15", result.Data.First().Date);
		Assert.Equal("Thursday, August 14", result.Data.Last().Date);

		Assert.Empty(result.Data.First().Items[0].Guests);
		Assert.Equal(2, result.Data.Last().Items[0].Guests.Count);
	}

	[Fact]
	public async Task Handle_Should_Return_Empty_When_User_Not_In_Meetings()
	{
		var meetings = GetMeetings(Guid.NewGuid());
		var mockContext = new Mock<IApplicationDbContext>();
		var currentUserService = new Mock<ICurrentUserService>();

		currentUserService.Setup(x => x.UserId).Returns(Guid.NewGuid());
		mockContext.Setup(x => x.Set<Meeting>()).Returns(meetings.BuildMockDbSet().Object);

		var handler = new MyMeetingQueryHandler(mockContext.Object, currentUserService.Object);

		var query = new MyMeetingQuery(MeetingStatus.Ended);

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

	private List<Meeting> GetMultipleMeetings(Guid userId)
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
				Guests = [new GuestsInMeeting() { FullName = "Mo" }, new GuestsInMeeting() { FullName = "Mo1" }]
			},

			new()
			{
				Id = meetingId,
				MeetId = "meet123",
				MeetName = "Test Meeting",
				Platform = "Google Meet",
				BotName = "Bot1",
				CreatedAt = new DateTime(2025, 8, 14, 14, 30, 0),
				Status = MeetingStatus.Recording,
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
				Id = meetingId,
				MeetId = "meet123",
				MeetName = "Test Meeting",
				Platform = "Google Meet",
				BotName = "Bot1",
				CreatedAt = new DateTime(2025, 8, 15, 14, 30, 0),
				Status = MeetingStatus.Paused,
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
				Id = meetingId,
				MeetId = "meet123",
				MeetName = "Test Meeting",
				Platform = "Google Meet",
				BotName = "Bot1",
				CreatedAt = new DateTime(2025, 8, 15, 14, 30, 0),
				Status = MeetingStatus.AddingBot,
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
