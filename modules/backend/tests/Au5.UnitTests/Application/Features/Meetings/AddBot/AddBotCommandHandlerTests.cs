using Au5.Application.Features.Meetings.AddBot;
using Au5.Application.Services;
using Au5.Application.Services.Models;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.AddBot;

public class AddBotCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IBotFatherAdapter> _botFatherMock;
	private readonly Mock<IMeetingUrlService> _meetingUrlServiceMock;
	private readonly Mock<ICacheProvider> _cacheProviderMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<DbSet<Meeting>> _meetingDbSetMock;
	private readonly AddBotCommandHandler _handler;

	public AddBotCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_botFatherMock = new Mock<IBotFatherAdapter>();
		_meetingUrlServiceMock = new Mock<IMeetingUrlService>();
		_cacheProviderMock = new Mock<ICacheProvider>();
		_meetingDbSetMock = new Mock<DbSet<Meeting>>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();

		_handler = new AddBotCommandHandler(
			_dbContextMock.Object,
			_botFatherMock.Object,
			_meetingUrlServiceMock.Object,
			_cacheProviderMock.Object,
			_currentUserServiceMock.Object);
	}

	[Fact]
	public async Task Handle_ShouldReturnSuccess_WhenValidRequest()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());
		var command = new AddBotCommand("Meets", "TestBot", "test-meet-id");

		var systemConfig = CreateSystemConfig();
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GetMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_dbContextMock.Verify(x => x.Set<Meeting>(), Times.Once);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		_meetingDbSetMock.Verify(x => x.Add(It.IsAny<Meeting>()), Times.Once);
		_botFatherMock.Verify(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Handle_ShouldReturnFailure_WhenSystemConfigNotFound()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "TestBot", "test-meet-id");

		var systemConfigs = new List<SystemConfig>();
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
		_dbContextMock.Verify(x => x.Set<Meeting>(), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
		_botFatherMock.Verify(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Handle_ShouldReturnFailure_WhenDatabaseSaveFails()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "TestBot", "test-meet-id");

		var systemConfig = CreateSystemConfig();
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure("Database error")));

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.Meeting.FailedToAddBot, result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		_botFatherMock.Verify(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()), Times.Never);
		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<Meeting>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task Handle_ShouldCreateMeetingWithCorrectProperties()
	{
		var userId = Guid.NewGuid();
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(userId);

		var command = new AddBotCommand("Meet", "MeetBot", "Meet-meet-123");

		var systemConfig = CreateSystemConfig();
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		Meeting capturedMeeting = null;
		_meetingDbSetMock.Setup(x => x.Add(It.IsAny<Meeting>()))
			.Callback<Meeting>(meeting => capturedMeeting = meeting);

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GetMeetingUrl("Meet", "Meet-meet-123"))
			.Returns("https://Meet.us/j/Meet-meet-123");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedMeeting);
		Assert.Equal("Meet-meet-123", capturedMeeting.MeetId);
		Assert.Equal("Meeting Transcription", capturedMeeting.MeetName);
		Assert.Equal("MeetBot", capturedMeeting.BotName);
		Assert.Equal(userId, capturedMeeting.BotInviterUserId);
		Assert.Equal("Meet", capturedMeeting.Platform);
		Assert.Equal(MeetingStatus.AddingBot, capturedMeeting.Status);
		Assert.False(capturedMeeting.IsBotAdded);
		Assert.NotEmpty(capturedMeeting.HashToken);
		Assert.True(capturedMeeting.CreatedAt <= DateTime.Now);
		Assert.True(capturedMeeting.CreatedAt >= DateTime.Now.AddMinutes(-1));
	}

	[Fact]
	public async Task Handle_ShouldBuildCorrectBotPayload()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "MeetsBot", "Meets-meet-456");
		var systemConfig = CreateSystemConfig();
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		BotPayload capturedPayload = null;
		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.Callback<string, BotPayload, CancellationToken>((url, payload, ct) => capturedPayload = payload)
			.ReturnsAsync((Result<string>)"bot-created");

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GetMeetingUrl("Meets", "Meets-meet-456"))
			.Returns("https://meets.google.com/Meets-meet-456");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedPayload);
		Assert.Equal(systemConfig.BotHubUrl, capturedPayload.HubUrl);
		Assert.Equal("Meets", capturedPayload.Platform);
		Assert.Equal("https://meets.google.com/Meets-meet-456", capturedPayload.MeetingUrl);
		Assert.Equal(systemConfig.BotName, capturedPayload.BotDisplayName);
		Assert.Equal("Meets-meet-456", capturedPayload.MeetId);
		Assert.Equal(systemConfig.Language, capturedPayload.Language);
		Assert.NotEmpty(capturedPayload.HashToken);

		Assert.Equal(systemConfig.AutoLeaveWaitingEnter, capturedPayload.AutoLeaveSettings.WaitingEnter);
		Assert.Equal(systemConfig.AutoLeaveNoParticipant, capturedPayload.AutoLeaveSettings.NoParticipant);
		Assert.Equal(systemConfig.AutoLeaveAllParticipantsLeft, capturedPayload.AutoLeaveSettings.AllParticipantsLeft);
		Assert.Equal(systemConfig.MeetingVideoRecording, capturedPayload.MeetingSettings.VideoRecording);
		Assert.Equal(systemConfig.MeetingAudioRecording, capturedPayload.MeetingSettings.AudioRecording);
		Assert.Equal(systemConfig.MeetingTranscription, capturedPayload.MeetingSettings.Transcription);
		Assert.Equal(systemConfig.MeetingTranscriptionModel, capturedPayload.MeetingSettings.TranscriptionModel);
	}

	[Fact]
	public async Task Handle_ShouldSetCacheWhenNoCachedMeetingExists()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "TestBot", "test-meet-id");

		var systemConfig = CreateSystemConfig();
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GetMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var expectedCacheKey = MeetingService.GetMeetingKey("test-meet-id");
	}

	[Fact]
	public async Task Handle_ShouldUpdateCachedMeetingId_When_CachedMeetingExists()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "TestBot", "test-meet-id");

		var systemConfig = CreateSystemConfig();
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		var existingCachedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "test-meet-id",
			Platform = "Meets"
		};

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GetMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(existingCachedMeeting);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var expectedCacheKey = MeetingService.GetMeetingKey("test-meet-id");
	}

	[Fact]
	public async Task Handle_ShouldCallBotFatherWithCorrectUrl()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "TestBot", "test-meet-id");

		var systemConfig = CreateSystemConfig();
		systemConfig.BotFatherUrl = "https://bot-father.example.com";
		var systemConfigs = new List<SystemConfig> { systemConfig };
		var systemConfigDbSet = systemConfigs.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<SystemConfig>()).Returns(systemConfigDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GetMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_botFatherMock.Verify(x => x.CreateBotContainerAsync("https://bot-father.example.com", It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()), Times.Once);
	}

	private static SystemConfig CreateSystemConfig()
	{
		return new SystemConfig
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization",
			BotName = "Au5 Bot",
			HubUrl = "https://hub.example.com",
			Direction = "ltr",
			Language = "en",
			ServiceBaseUrl = "https://service.example.com",
			BotFatherUrl = "https://bot-father.example.com",
			BotHubUrl = "https://bot-hub.example.com",
			OpenAIToken = "test-token",
			PanelUrl = "https://panel.example.com",
			AutoLeaveWaitingEnter = 5,
			AutoLeaveNoParticipant = 10,
			AutoLeaveAllParticipantsLeft = 15,
			MeetingVideoRecording = true,
			MeetingAudioRecording = true,
			MeetingTranscription = true,
			MeetingTranscriptionModel = "whisper-1"
		};
	}
}
