using Au5.Application.Features.AI.Delete;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.AI.Delete;

public class DeleteAIContentCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly DeleteAIContentCommandHandler _handler;
	private readonly Guid _userId;

	public DeleteAIContentCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_userId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(_userId);

		_handler = new DeleteAIContentCommandHandler(_dbContextMock.Object, _currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_AIContentDoesNotExist()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("AI Content not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_AIContentIsNotActive()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("AI Content not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingIdDoesNotMatch()
	{
		var aiContentId = Guid.NewGuid();
		var correctMeetingId = Guid.NewGuid();
		var wrongMeetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = correctMeetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		var command = new DeleteAIContentCommand(aiContentId, wrongMeetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("AI Content not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_IdDoesNotMatch()
	{
		var correctId = Guid.NewGuid();
		var wrongId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = correctId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		var command = new DeleteAIContentCommand(wrongId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("AI Content not found", result.Error.Description);
	}

	[Fact]
	public async Task Should_DeleteSuccessfully_When_AIContentExists()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true,
			RemoverUserId = null
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data);
	}

	[Fact]
	public async Task Should_SetIsActiveToFalse_When_DeletingAIContent()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		await _handler.Handle(command, CancellationToken.None);

		Assert.False(aiContent.IsActive);
	}

	[Fact]
	public async Task Should_SetRemoverUserId_When_DeletingAIContent()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true,
			RemoverUserId = null
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		await _handler.Handle(command, CancellationToken.None);

		Assert.Equal(_userId, aiContent.RemoverUserId);
	}

	[Fact]
	public async Task Should_CallSaveChangesAsync_When_DeletingAIContent()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		await _handler.Handle(command, CancellationToken.None);

		_dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_SoftDeleteNotHardDelete_When_DeletingAIContent()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true,
			Content = "Test Content"
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		await _handler.Handle(command, CancellationToken.None);

		Assert.False(aiContent.IsActive);
		Assert.NotNull(aiContent.Content);
		Assert.Equal(_userId, aiContent.RemoverUserId);
	}

	[Fact]
	public async Task Should_ReturnTrue_When_DeletionIsSuccessful()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(result.Data);
	}

	[Fact]
	public async Task Should_HandleCancellationToken_When_Provided()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();
		var cancellationToken = CancellationToken.None;

		var aiContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(cancellationToken))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, cancellationToken);

		Assert.True(result.IsSuccess);
		_dbContextMock.Verify(db => db.SaveChangesAsync(cancellationToken), Times.Once);
	}

	[Fact]
	public async Task Should_OnlyMatchActiveContent_When_MultipleRecordsExist()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var inactiveContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = false
		};

		var activeContent = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { inactiveContent, activeContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.False(activeContent.IsActive);
		Assert.Equal(_userId, activeContent.RemoverUserId);
	}

	[Fact]
	public async Task Should_NotModifyOtherRecords_When_DeletingSpecificContent()
	{
		var targetId = Guid.NewGuid();
		var otherId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var targetContent = new AIContents
		{
			Id = targetId,
			MeetingId = meetingId,
			IsActive = true
		};

		var otherContent = new AIContents
		{
			Id = otherId,
			MeetingId = meetingId,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { targetContent, otherContent }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var command = new DeleteAIContentCommand(targetId, meetingId);

		await _handler.Handle(command, CancellationToken.None);

		Assert.False(targetContent.IsActive);
		Assert.True(otherContent.IsActive);
		Assert.Equal(_userId, targetContent.RemoverUserId);
		Assert.Null(otherContent.RemoverUserId);
	}

	[Fact]
	public async Task Should_RequireAllConditions_When_FindingContent()
	{
		var aiContentId = Guid.NewGuid();
		var meetingId = Guid.NewGuid();

		var wrongIdActiveCorrectMeeting = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			IsActive = true
		};

		var correctIdInactiveCorrectMeeting = new AIContents
		{
			Id = aiContentId,
			MeetingId = meetingId,
			IsActive = false
		};

		var correctIdActiveWrongMeeting = new AIContents
		{
			Id = aiContentId,
			MeetingId = Guid.NewGuid(),
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>
			{
				wrongIdActiveCorrectMeeting,
				correctIdInactiveCorrectMeeting,
				correctIdActiveWrongMeeting
			}.BuildMockDbSet().Object);

		var command = new DeleteAIContentCommand(aiContentId, meetingId);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("AI Content not found", result.Error.Description);
	}
}
