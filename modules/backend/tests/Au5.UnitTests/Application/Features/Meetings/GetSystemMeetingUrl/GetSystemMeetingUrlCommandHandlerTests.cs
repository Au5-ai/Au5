using Au5.Application.Features.Meetings.GetSystemMeetingUrl;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.GetSystemMeetingUrl;

public class GetSystemMeetingUrlCommandHandlerTests
{
	[Fact]
	public async Task Handle_ShouldReturnNotFound_WhenMeeting_NotExists()
	{
		var id = Guid.NewGuid();
		var meetings = new List<Meeting>
		{
			new() { Id = id }
		};
		var systemConfig = new List<SystemConfig>
		{
			new() { Id = id, ServiceBaseUrl = "https://myapp.com" }
		};

		var mockDbSet = meetings.BuildMockDbSet();
		var mockSystemConfig = systemConfig.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		var urlServiceMock = new Mock<IMeetingUrlService>();
		var dataProviderMock = new Mock<IDataProvider>();

		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(mockSystemConfig.Object);
		dataProviderMock.Setup(x => x.UtcNow)
			.Returns(DateTime.UtcNow);

		var handler = new GetMeetingUrlCommandHandler(urlServiceMock.Object, dbContextMock.Object, dataProviderMock.Object);
		var command = new GetMeetingUrlCommand(Guid.NewGuid(), 30);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("No meeting with this ID was found.", result.Error.Description);
	}

	[Fact]
	public async Task Handle_ShouldGetSystemMeetingUrl_WhenValid()
	{
		var id = Guid.NewGuid();
		var meetId = "sxd-ksf-jgg";
		var bseTestUrl = "https://myapp.com";
		var meetings = new List<Meeting>
		{
			new() { Id = id, MeetId = meetId }
		};
		var systemConfig = new List<SystemConfig>
		{
			new() { Id = id, ServiceBaseUrl = bseTestUrl }
		};

		var mockDbSet = meetings.BuildMockDbSet();
		var mockSystemConfig = systemConfig.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		var urlServiceMock = new Mock<IMeetingUrlService>();
		var dataProviderMock = new Mock<IDataProvider>();

		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
		 .ReturnsAsync(Result.Success());
		dbContextMock.Setup(db => db.Set<SystemConfig>()).Returns(mockSystemConfig.Object);
		dataProviderMock.Setup(x => x.UtcNow)
			.Returns(DateTime.UtcNow);

		var expectedUrl = $"{bseTestUrl}/public/meeting/{id}/{meetId}";
		urlServiceMock.Setup(s => s.GeneratePublicMeetingUrl(bseTestUrl, id, meetId))
		  .Returns(expectedUrl);

		var handler = new GetMeetingUrlCommandHandler(urlServiceMock.Object, dbContextMock.Object, dataProviderMock.Object);
		var command = new GetMeetingUrlCommand(id, 30);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(urlServiceMock.Object.GeneratePublicMeetingUrl(bseTestUrl, id, meetId), result.Data.Link);
		dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}
}
