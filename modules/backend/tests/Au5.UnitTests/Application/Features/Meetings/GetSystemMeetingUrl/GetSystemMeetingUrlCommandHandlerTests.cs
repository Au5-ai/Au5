using Au5.Application.Features.Meetings.GetSystemMeetingUrl;
using Au5.Application.Features.Meetings.Rename;
using Au5.Domain.Entities;
using Au5.Shared;
using Microsoft.Extensions.Configuration;
using MockQueryable.Moq;
using static System.Net.WebRequestMethods;

namespace Au5.UnitTests.Application.Features.Meetings.Rename
{
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

			var mockDbSet = meetings.BuildMockDbSet();

			var dbContextMock = new Mock<IApplicationDbContext>();
			var urlServiceMock = new Mock<IMeetingUrlService>();
			var configurationMock = new Mock<IConfiguration>();

			dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockDbSet.Object);
			configurationMock.Setup(c => c["System:BaseUrl"])
			 .Returns("https://myapp.com");

			var handler = new GetMeetingUrlCommandHandler(urlServiceMock.Object, dbContextMock.Object, configurationMock.Object);
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

			var mockDbSet = meetings.BuildMockDbSet();

			var dbContextMock = new Mock<IApplicationDbContext>();
			var urlServiceMock = new Mock<IMeetingUrlService>();
			var configurationMock = new Mock<IConfiguration>();

			dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockDbSet.Object);
			configurationMock.Setup(c => c["System:BaseUrl"])
			 .Returns(bseTestUrl);

			var handler = new GetMeetingUrlCommandHandler(urlServiceMock.Object, dbContextMock.Object, configurationMock.Object);
			var command = new GetMeetingUrlCommand(id, 30);

			var result = await handler.Handle(command, CancellationToken.None);

			Assert.True(result.IsSuccess);
			Assert.Equal(urlServiceMock.Object.GetSystemMeetingUrl(bseTestUrl, id, meetId), result.Data.Link);
			dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		}
	}
}
