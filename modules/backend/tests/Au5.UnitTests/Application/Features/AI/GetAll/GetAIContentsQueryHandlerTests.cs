using Au5.Application.Features.AI.GetAll;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.AI.GetAll;

public class GetAIContentsQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly GetAIContentsQueryHandler _handler;

	public GetAIContentsQueryHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_handler = new GetAIContentsQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnEmptyList_When_NoAIContentsExist()
	{
		var meetingId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Empty(result.Data);
	}

	[Fact]
	public async Task Should_ReturnOnlyActiveContents_When_InactiveContentsExist()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "Test Description",
			Instructions = "Test Instructions"
		};

		var user = new User
		{
			Id = userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var activeContent = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Active content",
			CreatedAt = new DateTime(2025, 11, 16, 10, 0, 0),
			IsActive = true
		};

		var inactiveContent = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Inactive content",
			CreatedAt = new DateTime(2025, 11, 16, 9, 0, 0),
			IsActive = false
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { activeContent, inactiveContent }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Single(result.Data);
		Assert.Equal("Active content", result.Data.First().Content);
	}

	[Fact]
	public async Task Should_ReturnOnlyContentForSpecificMeeting_When_MultipleMeetingsExist()
	{
		var meetingId1 = Guid.NewGuid();
		var meetingId2 = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "Description",
			Instructions = "Instructions"
		};

		var user = new User
		{
			Id = userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var content1 = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId1,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Meeting 1 content",
			CreatedAt = DateTime.Now,
			IsActive = true
		};

		var content2 = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId2,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Meeting 2 content",
			CreatedAt = DateTime.Now,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { content1, content2 }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId1);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Single(result.Data);
		Assert.Equal("Meeting 1 content", result.Data.First().Content);
	}

	[Fact]
	public async Task Should_OrderByCreatedAtDescending_When_MultipleContentsExist()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "Test Assistant",
			Icon = "icon.png",
			Description = "Description",
			Instructions = "Instructions"
		};

		var user = new User
		{
			Id = userId,
			FullName = "John Doe",
			Email = "john@example.com",
			PictureUrl = "profile.jpg"
		};

		var oldContent = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Old content",
			CreatedAt = new DateTime(2025, 11, 16, 8, 0, 0),
			IsActive = true
		};

		var newContent = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "New content",
			CreatedAt = new DateTime(2025, 11, 16, 10, 0, 0),
			IsActive = true
		};

		var middleContent = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Middle content",
			CreatedAt = new DateTime(2025, 11, 16, 9, 0, 0),
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { oldContent, newContent, middleContent }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(3, result.Data.Count);
		Assert.Equal("New content", result.Data.ElementAt(0).Content);
		Assert.Equal("Middle content", result.Data.ElementAt(1).Content);
		Assert.Equal("Old content", result.Data.ElementAt(2).Content);
	}

	[Fact]
	public async Task Should_MapAssistantProperties_When_ReturningContent()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "GPT Assistant",
			Icon = "assistant-icon.png",
			Description = "AI powered assistant",
			Instructions = "Be helpful and concise"
		};

		var user = new User
		{
			Id = userId,
			FullName = "Jane Smith",
			Email = "jane@example.com",
			PictureUrl = "jane.jpg"
		};

		var content = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Test content",
			CreatedAt = new DateTime(2025, 11, 16, 10, 30, 0),
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { content }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data.First();
		Assert.Equal(assistantId, response.Assistant.Id);
		Assert.Equal("GPT Assistant", response.Assistant.Name);
		Assert.Equal("assistant-icon.png", response.Assistant.Icon);
		Assert.Equal("AI powered assistant", response.Assistant.Description);
		Assert.Equal("Be helpful and concise", response.Assistant.Instructions);
	}

	[Fact]
	public async Task Should_MapUserProperties_When_ReturningContent()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "Assistant",
			Icon = "icon.png",
			Description = "Description",
			Instructions = "Instructions"
		};

		var user = new User
		{
			Id = userId,
			FullName = "Bob Johnson",
			Email = "bob@example.com",
			PictureUrl = "bob-avatar.png"
		};

		var content = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Test content",
			CreatedAt = new DateTime(2025, 11, 16, 14, 45, 0),
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { content }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data.First();
		Assert.Equal(userId, response.User.Id);
		Assert.Equal("Bob Johnson", response.User.FullName);
		Assert.Equal("bob@example.com", response.User.Email);
		Assert.Equal("bob-avatar.png", response.User.PictureUrl);
	}

	[Fact]
	public async Task Should_FormatCreatedAtCorrectly_When_ReturningContent()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "Assistant",
			Icon = "icon.png",
			Description = "Description",
			Instructions = "Instructions"
		};

		var user = new User
		{
			Id = userId,
			FullName = "User",
			Email = "user@example.com",
			PictureUrl = "pic.jpg"
		};

		var createdAt = new DateTime(2025, 11, 16, 14, 30, 0);

		var content = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "Test content",
			CreatedAt = createdAt,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { content }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data.First();
		Assert.Equal("16 November 2025, 14:30", response.CreatedAt);
	}

	[Fact]
	public async Task Should_MapContentAndId_When_ReturningContent()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var userId = Guid.NewGuid();
		var contentId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			Name = "Assistant",
			Icon = "icon.png",
			Description = "Description",
			Instructions = "Instructions"
		};

		var user = new User
		{
			Id = userId,
			FullName = "User",
			Email = "user@example.com",
			PictureUrl = "pic.jpg"
		};

		var content = new AIContents
		{
			Id = contentId,
			MeetingId = meetingId,
			AssistantId = assistantId,
			Assistant = assistant,
			UserId = userId,
			User = user,
			Content = "This is the AI generated content",
			CreatedAt = DateTime.Now,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { content }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data.First();
		Assert.Equal(contentId, response.Id);
		Assert.Equal("This is the AI generated content", response.Content);
	}

	[Fact]
	public async Task Should_HandleMultipleContentsFromDifferentAssistants_When_QueryingMeeting()
	{
		var meetingId = Guid.NewGuid();
		var assistant1Id = Guid.NewGuid();
		var assistant2Id = Guid.NewGuid();
		var userId = Guid.NewGuid();

		var assistant1 = new Assistant
		{
			Id = assistant1Id,
			Name = "GPT-4",
			Icon = "gpt4.png",
			Description = "GPT-4 Assistant",
			Instructions = "Be creative"
		};

		var assistant2 = new Assistant
		{
			Id = assistant2Id,
			Name = "Claude",
			Icon = "claude.png",
			Description = "Claude Assistant",
			Instructions = "Be analytical"
		};

		var user = new User
		{
			Id = userId,
			FullName = "User",
			Email = "user@example.com",
			PictureUrl = "pic.jpg"
		};

		var content1 = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistant1Id,
			Assistant = assistant1,
			UserId = userId,
			User = user,
			Content = "GPT-4 response",
			CreatedAt = new DateTime(2025, 11, 16, 10, 0, 0),
			IsActive = true
		};

		var content2 = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistant2Id,
			Assistant = assistant2,
			UserId = userId,
			User = user,
			Content = "Claude response",
			CreatedAt = new DateTime(2025, 11, 16, 11, 0, 0),
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { content1, content2 }.BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(2, result.Data.Count);
		Assert.Contains(result.Data, r => r.Assistant.Name == "GPT-4" && r.Content == "GPT-4 response");
		Assert.Contains(result.Data, r => r.Assistant.Name == "Claude" && r.Content == "Claude response");
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_QueryingDatabase()
	{
		var meetingId = Guid.NewGuid();
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		var query = new GetAIContentsQuery(meetingId);

		await _handler.Handle(query, cancellationToken);

		_dbContextMock.Verify(db => db.Set<AIContents>(), Times.Once);
	}
}
