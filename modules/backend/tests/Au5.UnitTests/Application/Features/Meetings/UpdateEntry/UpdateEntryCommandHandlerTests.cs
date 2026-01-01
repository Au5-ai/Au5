using Au5.Application.Features.Meetings.UpdateEntry;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.UpdateEntry;

public class UpdateEntryCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnNotFound_When_EntryDoesNotExist()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Original content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var command = new UpdateEntryCommand(meetingId, 999, "New content");

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
			new() { Id = 1, MeetingId = differentMeetingId, Content = "Original content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var command = new UpdateEntryCommand(meetingId, 1, "New content");

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Entry.NotFound", result.Error.Code);
		Assert.Equal("No entry with this ID was found in the meeting.", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_ContentIsUnchanged()
	{
		var meetingId = Guid.NewGuid();
		var originalContent = "Original content";
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = originalContent }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var command = new UpdateEntryCommand(meetingId, 1, originalContent);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(originalContent, entries.First().Content);
		dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_UpdateContent_When_ValidRequest()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Original content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Result.Success());

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var command = new UpdateEntryCommand(meetingId, 1, "Updated content");

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal("Updated content", entries.First().Content);
		dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Original content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Error.Failure("Database.Error", "Database operation failed"));

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var command = new UpdateEntryCommand(meetingId, 1, "Updated content");

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Entry.FailedToUpdate", result.Error.Code);
		Assert.Equal("Failed to save changes. Please try again later.", result.Error.Description);
	}

	[Fact]
	public async Task Should_UpdateContent_When_ContentContainsSpecialCharacters()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Original content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Result.Success());

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var specialContent = "Updated content with special chars: @#$%^&*(){}[]<>?/\\|~`";
		var command = new UpdateEntryCommand(meetingId, 1, specialContent);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(specialContent, entries.First().Content);
	}

	[Fact]
	public async Task Should_UpdateContent_When_ContentContainsUnicodeCharacters()
	{
		var meetingId = Guid.NewGuid();
		var entries = new List<Entry>
		{
			new() { Id = 1, MeetingId = meetingId, Content = "Original content" }
		};

		var mockDbSet = entries.BuildMockDbSet();
		var dbContextMock = new Mock<IApplicationDbContext>();

		dbContextMock.Setup(db => db.Set<Entry>()).Returns(mockDbSet.Object);
		dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
					 .ReturnsAsync(Result.Success());

		var handler = new UpdateEntryCommandHandler(dbContextMock.Object);
		var unicodeContent = "محتوای فارسی و 中文内容 和 日本語コンテンツ";
		var command = new UpdateEntryCommand(meetingId, 1, unicodeContent);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(unicodeContent, entries.First().Content);
	}
}
