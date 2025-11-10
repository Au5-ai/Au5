using Au5.Application.Features.Meetings.Rename;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.Rename
{
	public class RenameMeetingCommandHandlerTests
	{
		[Fact]
		public async Task Handle_ShouldReturnNotFound_WhenMeeting_NotExists()
		{
			var meetings = new List<Meeting>
			{
				new() { MeetId = "1", MeetName = "Title" }
			};

			var mockDbSet = meetings.BuildMockDbSet();
			var dbContextMock = new Mock<IApplicationDbContext>();

			dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockDbSet.Object);

			var handler = new RenameMeetingCommandHandler(dbContextMock.Object);
			var command = new RenameMeetingCommand("2", "New Title");

			var result = await handler.Handle(command, CancellationToken.None);

			Assert.True(result.IsFailure);
			Assert.Equal("No meeting with this ID was found.", result.Error.Description);
		}

		[Fact]
		public async Task Handle_ShouldUpdateMeetingName_WhenValid()
		{
			var meetings = new List<Meeting>
			{
				new() { MeetId = "1", MeetName = "Old Name" }
			};

			var mockDbSet = meetings.BuildMockDbSet();

			var dbContextMock = new Mock<IApplicationDbContext>();
			dbContextMock.Setup(c => c.Set<Meeting>()).Returns(mockDbSet.Object);
			dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
						 .ReturnsAsync(Result.Success());

			var handler = new RenameMeetingCommandHandler(dbContextMock.Object);
			var command = new RenameMeetingCommand("1", "New Title");

			var result = await handler.Handle(command, CancellationToken.None);

			Assert.True(result.IsSuccess);
			Assert.Equal("New Title", meetings.Single().MeetName);
			dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		}
	}
}
