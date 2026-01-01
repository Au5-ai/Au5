using Au5.Application.Features.Meetings.DeleteEntry;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.DeleteEntry;

public class DeleteEntryCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnNotFound_When_EntryDoesNotExist()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Test content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);

		var handler = new DeleteEntryCommandHandler(dbContextMock.Object);
		var command = new DeleteEntryCommand(meetingId, 999);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Entry.NotFound", result.Error.Code);
		Assert.Equal("No entry with this ID was found in the meeting.", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_EntryExistsButDifferentMeeting()
	{
		var meetingId = Guid.NewGuid();
		var differentMeetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = differentMeetingId, Content = "Test content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);

		var handler = new DeleteEntryCommandHandler(dbContextMock.Object);
		var command = new DeleteEntryCommand(meetingId, 1);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Entry.NotFound", result.Error.Code);
		Assert.Equal("No entry with this ID was found in the meeting.", result.Error.Description);
	}

	[Fact]
	public async Task Should_DeleteEntry_When_ValidRequest()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Test content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Result.Success());

		var handler = new DeleteEntryCommandHandler(dbContextMock.Object);
		var command = new DeleteEntryCommand(meetingId, 1);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data.IsDeleted);
		mockDbSet.Verify(m => m.Remove(It.IsAny<Entry>()), Times.Once);
		dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Test content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Error.Failure("Database.Error", "Database operation failed"));

		var handler = new DeleteEntryCommandHandler(dbContextMock.Object);
		var command = new DeleteEntryCommand(meetingId, 1);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Entry.FailedToDelete", result.Error.Code);
		Assert.Equal("Failed to delete entry. Please try again later.", result.Error.Description);
	}

	[Fact]
	public async Task Should_DeleteCorrectEntry_When_MultipleEntriesExist()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Entry 1" },
			new() { Id = 2, MeetingId = meetingId, Content = "Entry 2" },
			new() { Id = 3, MeetingId = meetingId, Content = "Entry 3" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Result.Success());

		var handler = new DeleteEntryCommandHandler(dbContextMock.Object);
		var command = new DeleteEntryCommand(meetingId, 2);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data.IsDeleted);
		mockDbSet.Verify(m => m.Remove(It.Is<Entry>(e => e.Id == 2)), Times.Once);
	}
}