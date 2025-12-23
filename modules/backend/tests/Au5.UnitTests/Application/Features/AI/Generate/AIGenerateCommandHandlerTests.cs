using System.Text.Json;
using Au5.Application.Common.Abstractions;
using Au5.Application.Dtos.AI;
using Au5.Application.Features.AI.Generate;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.AI.Generate;

public class AIGenerateCommandHandlerTests
{
	private readonly Mock<IAIClient> _aiAdapterMock;
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly AIGenerateCommandHandler _handler;
	private readonly Guid _userId;
	private readonly Guid _organizationId;

	public AIGenerateCommandHandlerTests()
	{
		_aiAdapterMock = new Mock<IAIClient>();
		_dbContextMock = new Mock<IApplicationDbContext>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_dataProviderMock = new Mock<IDataProvider>();

		_userId = Guid.NewGuid();
		_organizationId = Guid.NewGuid();

		_currentUserServiceMock.Setup(x => x.UserId).Returns(_userId);
		_currentUserServiceMock.Setup(x => x.OrganizationId).Returns(_organizationId);
		_dataProviderMock.Setup(x => x.Now).Returns(new DateTime(2025, 11, 16, 10, 0, 0));

		_handler = new AIGenerateCommandHandler(
			_aiAdapterMock.Object,
			_dbContextMock.Object,
			_currentUserServiceMock.Object,
			_dataProviderMock.Object);
	}

	[Fact]
	public async Task Should_ReturnExistingContent_When_AIContentAlreadyExists()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var existingContent = "Existing AI generated content";

		var aiContent = new AIContents
		{
			Id = Guid.NewGuid(),
			MeetingId = meetingId,
			AssistantId = assistantId,
			Content = existingContent,
			IsActive = true
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents> { aiContent }.BuildMockDbSet().Object);

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.Single(results);
		var jsonResult = JsonSerializer.Deserialize<JsonElement>(results[0]);
		Assert.Equal("cached", jsonResult.GetProperty("type").GetString());
		Assert.Equal(existingContent, jsonResult.GetProperty("content").GetString());
		_aiAdapterMock.Verify(
			x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()),
			Times.Never);
	}

	[Fact]
	public async Task Should_ReturnError_When_AssistantNotFound()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant>().BuildMockDbSet().Object);

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.Single(results);
		var jsonResult = JsonSerializer.Deserialize<JsonElement>(results[0]);
		Assert.Equal("error", jsonResult.GetProperty("type").GetString());
		Assert.Equal("Assistant not found.", jsonResult.GetProperty("error").GetString());
	}

	[Fact]
	public async Task Should_ReturnError_When_MeetingNotFound()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var organization = new Organization
		{
			Id = _organizationId
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting>().BuildMockDbSet().Object);

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.Single(results);
		var jsonResult = JsonSerializer.Deserialize<JsonElement>(results[0]);
		Assert.Equal("error", jsonResult.GetProperty("type").GetString());
		Assert.Equal("Meeting not found.", jsonResult.GetProperty("error").GetString());
	}

	[Fact]
	public async Task Should_CallAIEngine_When_AllEntitiesExist()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var organization = new Organization
		{
			Id = _organizationId
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Organization>())
			.Returns(new List<Organization> { organization }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(Array.Empty<string>()));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		_aiAdapterMock.Verify(
			x => x.RunThreadAsync(
				It.Is<RunThreadRequest>(r =>
					r.AssistantId == assistant.OpenAIAssistantId),
				It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task Should_StreamJsonChunks_When_AIEngineReturnsData()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var textChunk1 = JsonSerializer.Serialize(new { type = "text", text = "Hello" });
		var textChunk2 = JsonSerializer.Serialize(new { type = "text", text = " World" });
		var statusChunk = JsonSerializer.Serialize(new { type = "status", status = "completed" });
		var chunks = new[] { textChunk1, textChunk2, statusChunk };
		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(chunks));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.Equal(3, results.Count);
	}

	[Fact]
	public async Task Should_SaveAIContent_When_CompletedMessageReceived()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		AIContents capturedAIContent = null;
		var aiContentsDbSetMock = new List<AIContents>().BuildMockDbSet();
		aiContentsDbSetMock.Setup(x => x.Add(It.IsAny<AIContents>()))
			.Callback<AIContents>(content => capturedAIContent = content);

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(aiContentsDbSetMock.Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var textChunk1 = JsonSerializer.Serialize(new { type = "text", text = "Generated " });
		var textChunk2 = JsonSerializer.Serialize(new { type = "text", text = "AI content" });
		var statusChunk = JsonSerializer.Serialize(new { type = "status", status = "completed" });

		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(new[] { textChunk1, textChunk2, statusChunk }));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.NotNull(capturedAIContent);
		Assert.Equal("Generated AI content", capturedAIContent.Content);
		Assert.Equal(meetingId, capturedAIContent.MeetingId);
		Assert.Equal(assistantId, capturedAIContent.AssistantId);
		Assert.True(capturedAIContent.IsActive);
		Assert.Equal(_userId, capturedAIContent.UserId);
		_dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_HandleEmptyOrWhitespaceChunks_When_Streaming()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var chunk1 = JsonSerializer.Serialize(new { type = "text", text = "chunk1" });
		var chunk2 = JsonSerializer.Serialize(new { type = "text", text = "chunk2" });
		var chunks = new[] { chunk1, string.Empty, "   ", null, chunk2 };
		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(chunks));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.Equal(2, results.Count);
		Assert.Contains(chunk1, results);
		Assert.Contains(chunk2, results);
	}

	[Fact]
	public async Task Should_IgnoreInvalidJson_When_ParsingFails()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var validChunk = JsonSerializer.Serialize(new { type = "text", text = "valid" });
		var chunks = new[] { "invalid json", "{ broken json", validChunk };
		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(chunks));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.Single(results);
		Assert.Equal(validChunk, results[0]);
	}

	[Fact]
	public async Task Should_NotSaveContent_When_NoCompletedMessage()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		var otherMessage = JsonSerializer.Serialize(new
		{
			type = "status",
			status = "in_progress"
		});

		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(new[] { otherMessage }));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		_dbContextMock.Verify(db => db.Set<AIContents>().Add(It.IsAny<AIContents>()), Times.Never);
		_dbContextMock.Verify(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_SetCreatedAt_When_SavingAIContent()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		var expectedDate = new DateTime(2025, 11, 16, 10, 0, 0);

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		AIContents capturedAIContent = null;
		var aiContentsDbSetMock = new List<AIContents>().BuildMockDbSet();
		aiContentsDbSetMock.Setup(x => x.Add(It.IsAny<AIContents>()))
			.Callback<AIContents>(content => capturedAIContent = content);

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(aiContentsDbSetMock.Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		var textChunk = JsonSerializer.Serialize(new { type = "text", text = "Content" });
		var statusChunk = JsonSerializer.Serialize(new { type = "status", status = "completed" });

		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(ToAsyncEnumerable(new[] { textChunk, statusChunk }));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, CancellationToken.None))
		{
			results.Add(result);
		}

		Assert.NotNull(capturedAIContent);
		Assert.Equal(expectedDate, capturedAIContent.CreatedAt);
	}

	[Fact]
	public async Task Should_PassCancellationToken_When_CallingAIEngine()
	{
		var meetingId = Guid.NewGuid();
		var assistantId = Guid.NewGuid();
		using var cts = new CancellationTokenSource();
		var cancellationToken = cts.Token;

		var assistant = new Assistant
		{
			Id = assistantId,
			OrganizationId = _organizationId,
			OpenAIAssistantId = "asst_test123"
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			User = new User { Id = _userId },
			Guests = [],
			Participants = [],
			Entries = []
		};

		_dbContextMock.Setup(db => db.Set<AIContents>())
			.Returns(new List<AIContents>().BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Assistant>())
			.Returns(new List<Assistant> { assistant }.BuildMockDbSet().Object);

		_dbContextMock.Setup(db => db.Set<Meeting>())
			.Returns(new List<Meeting> { meeting }.BuildMockDbSet().Object);

		_aiAdapterMock.Setup(
				x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), cancellationToken))
			.ReturnsAsync(ToAsyncEnumerable(Array.Empty<string>()));

		var command = new AIGenerateCommand
		{
			MeetingId = meetingId,
			AssistantId = assistantId
		};

		var results = new List<string>();
		await foreach (var result in _handler.Handle(command, cancellationToken))
		{
			results.Add(result);
		}

		_aiAdapterMock.Verify(
			x => x.RunThreadAsync(It.IsAny<RunThreadRequest>(), cancellationToken),
			Times.Once);
	}

	private static async IAsyncEnumerable<T> ToAsyncEnumerable<T>(
		IEnumerable<T> source)
	{
		foreach (var item in source)
		{
			yield return item;
			await Task.CompletedTask;
		}
	}
}
