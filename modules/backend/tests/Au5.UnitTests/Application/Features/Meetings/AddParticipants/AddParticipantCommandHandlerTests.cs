using Au5.Application.Features.Meetings.AddParticipants;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.AddParticipants;

public class AddParticipantCommandHandlerTests
{
	[Fact]
	public async Task Should_ReturnNotFoundError_When_MeetingDoesNotExist()
	{
		var nonExistentMeetingId = Guid.NewGuid();
		var participantIds = new List<Guid> { Guid.NewGuid() };

		var meetings = new List<Meeting>();
		var mockMeetingDbSet = meetings.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(nonExistentMeetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Meeting.NotFound", result.Error.Code);
		Assert.Equal(AppResources.Meeting.NotFound, result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_AllParticipantsAlreadyExist()
	{
		var meetingId = Guid.NewGuid();
		var userId1 = Guid.NewGuid();
		var userId2 = Guid.NewGuid();
		var participantIds = new List<Guid> { userId1, userId2 };

		var meetings = new List<Meeting>
		{
			new() { Id = meetingId, MeetName = "Test Meeting" }
		};

		var existingParticipants = new List<ParticipantInMeeting>
		{
			new() { MeetingId = meetingId, UserId = userId1 },
			new() { MeetingId = meetingId, UserId = userId2 }
		};

		var mockMeetingDbSet = meetings.BuildMockDbSet();
		var mockParticipantDbSet = existingParticipants.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);
		dbContextMock.Setup(db => db.Set<ParticipantInMeeting>()).Returns(mockParticipantDbSet.Object);

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(meetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_NoValidUsersFound()
	{
		var meetingId = Guid.NewGuid();
		var nonExistentUserId = Guid.NewGuid();
		var participantIds = new List<Guid> { nonExistentUserId };

		var meetings = new List<Meeting>
		{
			new() { Id = meetingId, MeetName = "Test Meeting" }
		};

		var existingParticipants = new List<ParticipantInMeeting>();
		var users = new List<User>();

		var mockMeetingDbSet = meetings.BuildMockDbSet();
		var mockParticipantDbSet = existingParticipants.BuildMockDbSet();
		var mockUserDbSet = users.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);
		dbContextMock.Setup(db => db.Set<ParticipantInMeeting>()).Returns(mockParticipantDbSet.Object);
		dbContextMock.Setup(db => db.Set<User>()).Returns(mockUserDbSet.Object);

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(meetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_AddNewParticipants_When_ValidUsersProvided()
	{
		var meetingId = Guid.NewGuid();
		var userId1 = Guid.NewGuid();
		var userId2 = Guid.NewGuid();
		var participantIds = new List<Guid> { userId1, userId2 };

		var meetings = new List<Meeting>
		{
			new() { Id = meetingId, MeetName = "Test Meeting" }
		};

		var existingParticipants = new List<ParticipantInMeeting>();

		var users = new List<User>
		{
			new() { Id = userId1, FullName = "John Doe", Email = "john@example.com", PictureUrl = "http://example.com/john.jpg" },
			new() { Id = userId2, FullName = "Jane Smith", Email = "jane@example.com", PictureUrl = "http://example.com/jane.jpg" }
		};

		var mockMeetingDbSet = meetings.BuildMockDbSet();
		var mockParticipantDbSet = existingParticipants.BuildMockDbSet();
		var mockUserDbSet = users.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);
		dbContextMock.Setup(db => db.Set<ParticipantInMeeting>()).Returns(mockParticipantDbSet.Object);
		dbContextMock.Setup(db => db.Set<User>()).Returns(mockUserDbSet.Object);
		dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(meetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(2, result.Data.Count);

		var participant1 = result.Data.First(p => p.Id == userId1);
		Assert.Equal("John Doe", participant1.FullName);
		Assert.Equal("john@example.com", participant1.Email);
		Assert.Equal("http://example.com/john.jpg", participant1.PictureUrl);

		var participant2 = result.Data.First(p => p.Id == userId2);
		Assert.Equal("Jane Smith", participant2.FullName);
		Assert.Equal("jane@example.com", participant2.Email);
		Assert.Equal("http://example.com/jane.jpg", participant2.PictureUrl);

		dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_AddOnlyNewParticipants_When_SomeAlreadyExist()
	{
		var meetingId = Guid.NewGuid();
		var existingUserId = Guid.NewGuid();
		var newUserId = Guid.NewGuid();
		var participantIds = new List<Guid> { existingUserId, newUserId };

		var meetings = new List<Meeting>
		{
			new() { Id = meetingId, MeetName = "Test Meeting" }
		};

		var existingParticipants = new List<ParticipantInMeeting>
		{
			new() { MeetingId = meetingId, UserId = existingUserId }
		};

		var users = new List<User>
		{
			new() { Id = existingUserId, FullName = "Existing User", Email = "existing@example.com", PictureUrl = "http://example.com/existing.jpg" },
			new() { Id = newUserId, FullName = "New User", Email = "new@example.com", PictureUrl = "http://example.com/new.jpg" }
		};

		var mockMeetingDbSet = meetings.BuildMockDbSet();
		var mockParticipantDbSet = existingParticipants.BuildMockDbSet();
		var mockUserDbSet = users.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);
		dbContextMock.Setup(db => db.Set<ParticipantInMeeting>()).Returns(mockParticipantDbSet.Object);
		dbContextMock.Setup(db => db.Set<User>()).Returns(mockUserDbSet.Object);
		dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(meetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Single(result.Data);

		var addedParticipant = result.Data.First();
		Assert.Equal(newUserId, addedParticipant.Id);
		Assert.Equal("New User", addedParticipant.FullName);
		Assert.Equal("new@example.com", addedParticipant.Email);

		dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailureError_When_DatabaseSaveFails()
	{
		var meetingId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var participantIds = new List<Guid> { userId };

		var meetings = new List<Meeting>
		{
			new() { Id = meetingId, MeetName = "Test Meeting" }
		};

		var existingParticipants = new List<ParticipantInMeeting>();

		var users = new List<User>
		{
			new() { Id = userId, FullName = "Test User", Email = "test@example.com", PictureUrl = "http://example.com/test.jpg" }
		};

		var mockMeetingDbSet = meetings.BuildMockDbSet();
		var mockParticipantDbSet = existingParticipants.BuildMockDbSet();
		var mockUserDbSet = users.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);
		dbContextMock.Setup(db => db.Set<ParticipantInMeeting>()).Returns(mockParticipantDbSet.Object);
		dbContextMock.Setup(db => db.Set<User>()).Returns(mockUserDbSet.Object);
		dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Error.Failure("Database.SaveFailed", "Failed to save changes"));

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(meetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsFailure);
		Assert.Equal("Participant.AddFailed", result.Error.Code);
		Assert.Equal("Failed to add participant to the meeting. Please try again or contact support if the issue persists.", result.Error.Description);
	}

	[Fact]
	public async Task Should_HandleEmptyParticipantIdsList_When_Provided()
	{
		var meetingId = Guid.NewGuid();
		var participantIds = new List<Guid>();

		var meetings = new List<Meeting>
		{
			new() { Id = meetingId, MeetName = "Test Meeting" }
		};

		var existingParticipants = new List<ParticipantInMeeting>();

		var mockMeetingDbSet = meetings.BuildMockDbSet();
		var mockParticipantDbSet = existingParticipants.BuildMockDbSet();

		var dbContextMock = new Mock<IApplicationDbContext>();
		dbContextMock.Setup(db => db.Set<Meeting>()).Returns(mockMeetingDbSet.Object);
		dbContextMock.Setup(db => db.Set<ParticipantInMeeting>()).Returns(mockParticipantDbSet.Object);

		var handler = new AddParticipantCommandHandler(dbContextMock.Object);
		var command = new AddParticipantCommand(meetingId, participantIds);

		var result = await handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Empty(result.Data);
		dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}
}
