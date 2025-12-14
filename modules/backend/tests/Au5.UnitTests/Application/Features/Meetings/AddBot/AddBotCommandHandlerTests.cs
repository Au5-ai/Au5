using Au5.Application.Common.Options;
using Au5.Application.Features.Meetings.AddBot;
using Au5.Application.Services.Models;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.AddBot;

public class AddBotCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IBotFatherAdapter> _botFatherMock;
	private readonly Mock<IUrlGenerator> _meetingUrlServiceMock;
	private readonly Mock<ICacheProvider> _cacheProviderMock;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<DbSet<Meeting>> _meetingDbSetMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IMeetingService> _meetingServiceMock;
	private readonly AddBotCommandHandler _handler;
	private readonly Mock<IOptions<OrganizationOptions>> _options;

	public AddBotCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_botFatherMock = new Mock<IBotFatherAdapter>();
		_meetingUrlServiceMock = new Mock<IUrlGenerator>();
		_cacheProviderMock = new Mock<ICacheProvider>();
		_meetingDbSetMock = new Mock<DbSet<Meeting>>();
		_currentUserServiceMock = new Mock<ICurrentUserService>();
		_dataProviderMock = new Mock<IDataProvider>();
		_meetingServiceMock = new Mock<IMeetingService>();
		_options = new Mock<IOptions<OrganizationOptions>>();

		var organizationOptions = new OrganizationOptions
		{
			BotFatherUrl = "https://botfather.test",
			BotHubUrl = "https://bothub.test",
			AutoLeaveWaitingEnter = 5,
			AutoLeaveNoParticipant = 10,
			AutoLeaveAllParticipantsLeft = 15,
			MeetingVideoRecording = true,
			MeetingAudioRecording = true,
			MeetingTranscription = true,
			MeetingTranscriptionModel = "whisper-1"
		};
		_options.Setup(x => x.Value).Returns(organizationOptions);

		_handler = new AddBotCommandHandler(
			_dbContextMock.Object,
			_botFatherMock.Object,
			_meetingUrlServiceMock.Object,
			_cacheProviderMock.Object,
			_currentUserServiceMock.Object,
			_dataProviderMock.Object,
			_meetingServiceMock.Object,
			_options.Object);
	}

	[Fact]
	public async Task Handle_ShouldReturnSuccess_WhenValidRequest()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());
		var command = new AddBotCommand("Meets", "test-meet-id");

		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
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
	public async Task Handle_ShouldReturnFailure_WhenOrganizationNotFound()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");

		var organizations = new List<Organization>();
		var organizationDbSet = organizations.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.Organization.IsNotConfigured, result.Error.Description);
		_dbContextMock.Verify(x => x.Set<Meeting>(), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
		_botFatherMock.Verify(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Handle_ShouldReturnFailure_WhenDatabaseSaveFails()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");

		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
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

		var command = new AddBotCommand("Meet", "Meet-meet-123");

		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		Meeting capturedMeeting = null;
		_meetingDbSetMock.Setup(x => x.Add(It.IsAny<Meeting>()))
			.Callback<Meeting>(meeting => capturedMeeting = meeting);

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meet", "Meet-meet-123"))
			.Returns("https://Meet.us/j/Meet-meet-123");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");
		var now = DateTime.Parse("2025-01-15T10:00:00");
		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedMeeting);

		Assert.Equal("Meet-meet-123", capturedMeeting.MeetId);
		Assert.Equal("Meeting Transcription", capturedMeeting.MeetName);
		Assert.Equal("Au5 Bot", capturedMeeting.BotName);
		Assert.Equal(userId, capturedMeeting.BotInviterUserId);
		Assert.Equal("Meet", capturedMeeting.Platform);
		Assert.Equal(MeetingStatus.WaitingToAddBot, capturedMeeting.Status);
		Assert.False(capturedMeeting.IsBotAdded);
		Assert.NotEmpty(capturedMeeting.HashToken);
		Assert.True(capturedMeeting.CreatedAt <= now);
		Assert.True(capturedMeeting.CreatedAt >= now.AddMinutes(-1));
	}

	[Fact]
	public async Task Handle_ShouldBuildCorrectBotPayload()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "Meets-meet-456");
		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		BotPayload capturedPayload = null;
		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.Callback<string, BotPayload, CancellationToken>((url, payload, ct) => capturedPayload = payload)
			.ReturnsAsync((Result<string>)"bot-created");

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "Meets-meet-456"))
			.Returns("https://meets.google.com/Meets-meet-456");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedPayload);
		Assert.Equal("Meets", capturedPayload.Platform);
		Assert.Equal("https://meets.google.com/Meets-meet-456", capturedPayload.MeetingUrl);
		Assert.Equal("Meets-meet-456", capturedPayload.MeetId);
		Assert.NotEmpty(capturedPayload.HashToken);
	}

	[Fact]
	public async Task Handle_ShouldSetCacheWhenNoCachedMeetingExists()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");

		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_meetingServiceMock.Verify(x => x.GetMeetingKey("test-meet-id"), Times.AtLeastOnce);
	}

	[Fact]
	public async Task Handle_ShouldUpdateCachedMeetingId_When_CachedMeetingExists()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");

		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		var existingCachedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "test-meet-id",
			Platform = "Meets"
		};

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(existingCachedMeeting);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_meetingServiceMock.Verify(x => x.GetMeetingKey("test-meet-id"), Times.AtLeastOnce);
	}

	[Fact]
	public async Task Handle_ShouldCallBotFatherWithCorrectUrl()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");

		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_botFatherMock.Verify(
			x => x.CreateBotContainerAsync(
				"https://botfather.test",
				It.IsAny<BotPayload>(),
				It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task Handle_ShouldBuildPayloadWithCorrectAutoLeaveSettings()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");
		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		BotPayload capturedPayload = null;
		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.Callback<string, BotPayload, CancellationToken>((url, payload, ct) => capturedPayload = payload)
			.ReturnsAsync((Result<string>)"bot-created");

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedPayload);
		Assert.NotNull(capturedPayload.AutoLeaveSettings);
		Assert.Equal(5, capturedPayload.AutoLeaveSettings.WaitingEnter);
		Assert.Equal(10, capturedPayload.AutoLeaveSettings.NoParticipant);
		Assert.Equal(15, capturedPayload.AutoLeaveSettings.AllParticipantsLeft);
	}

	[Fact]
	public async Task Handle_ShouldBuildPayloadWithCorrectMeetingSettings()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");
		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		BotPayload capturedPayload = null;
		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.Callback<string, BotPayload, CancellationToken>((url, payload, ct) => capturedPayload = payload)
			.ReturnsAsync((Result<string>)"bot-created");

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedPayload);
		Assert.NotNull(capturedPayload.MeetingSettings);
		Assert.True(capturedPayload.MeetingSettings.VideoRecording);
		Assert.True(capturedPayload.MeetingSettings.AudioRecording);
		Assert.True(capturedPayload.MeetingSettings.Transcription);
		Assert.Equal("whisper-1", capturedPayload.MeetingSettings.TranscriptionModel);
	}

	[Fact]
	public async Task Handle_ShouldSetNewCache_When_CachedMeetingStatusIsEnded()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Meets", "test-meet-id");
		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		var endedMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "test-meet-id",
			Platform = "Meets",
			Status = MeetingStatus.Ended
		};

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Meets", "test-meet-id"))
			.Returns("https://meets.google.com/test-meet-id");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync(endedMeeting);

		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Result<string>)"bot-created");

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		_cacheProviderMock.Verify(
			x => x.SetAsync(
				It.IsAny<string>(),
				It.Is<Meeting>(m => m.Status == MeetingStatus.WaitingToAddBot),
				It.Is<TimeSpan>(t => t == TimeSpan.FromHours(2))),
			Times.Once);
	}

	[Fact]
	public async Task Handle_ShouldBuildPayloadWithAllRequiredProperties()
	{
		_currentUserServiceMock.Setup(Object => Object.UserId).Returns(Guid.NewGuid());

		var command = new AddBotCommand("Zoom", "zoom-123");
		var organization = CreateOrganization();
		_currentUserServiceMock.Setup(Object => Object.OrganizationId).Returns(organization.Id);

		var organizations = new List<Organization> { organization };
		var organizationDbSet = organizations.BuildMockDbSet();

		BotPayload capturedPayload = null;
		_botFatherMock.Setup(x => x.CreateBotContainerAsync(It.IsAny<string>(), It.IsAny<BotPayload>(), It.IsAny<CancellationToken>()))
			.Callback<string, BotPayload, CancellationToken>((url, payload, ct) => capturedPayload = payload)
			.ReturnsAsync((Result<string>)"bot-created");

		_dbContextMock.Setup(x => x.Set<Organization>()).Returns(organizationDbSet.Object);
		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(_meetingDbSetMock.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());

		_meetingUrlServiceMock.Setup(x => x.GenerateMeetingUrl("Zoom", "zoom-123"))
			.Returns("https://zoom.us/j/zoom-123");

		_cacheProviderMock.Setup(x => x.GetAsync<Meeting>(It.IsAny<string>()))
			.ReturnsAsync((Meeting)null);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(capturedPayload);
		Assert.Equal("https://bothub.test", capturedPayload.HubUrl);
		Assert.Equal("Zoom", capturedPayload.Platform);
		Assert.Equal("https://zoom.us/j/zoom-123", capturedPayload.MeetingUrl);
		Assert.Equal("Au5 Bot", capturedPayload.BotDisplayName);
		Assert.Equal("zoom-123", capturedPayload.MeetId);
		Assert.NotEmpty(capturedPayload.HashToken);
		Assert.Equal("en", capturedPayload.Language);
	}

	private static Organization CreateOrganization()
	{
		return new Organization
		{
			Id = Guid.NewGuid(),
			OrganizationName = "Test Organization",
			BotName = "Au5 Bot",
			Direction = "ltr",
			Language = "en",
		};
	}
}
