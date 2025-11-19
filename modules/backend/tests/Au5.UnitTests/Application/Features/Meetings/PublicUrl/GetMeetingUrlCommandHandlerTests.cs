using Au5.Application.Common.Options;
using Au5.Application.Features.Meetings.PublicUrl;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.PublicUrl;

public class GetMeetingUrlCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IUrlGenerator> _urlGeneratorMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _optionsMock;
	private readonly GetMeetingUrlCommandHandler _handler;
	private readonly OrganizationOptions _organizationOptions;

	public GetMeetingUrlCommandHandlerTests()
	{
		_dbContextMock = new Mock<IApplicationDbContext>();
		_urlGeneratorMock = new Mock<IUrlGenerator>();
		_dataProviderMock = new Mock<IDataProvider>();
		_optionsMock = new Mock<IOptions<OrganizationOptions>>();

		_organizationOptions = new OrganizationOptions
		{
			ServiceBaseUrl = "https://service.test.com"
		};

		_optionsMock.Setup(x => x.Value).Returns(_organizationOptions);

		_handler = new GetMeetingUrlCommandHandler(
			_urlGeneratorMock.Object,
			_dbContextMock.Object,
			_dataProviderMock.Object,
			_optionsMock.Object);
	}

	[Fact]
	public async Task Should_ReturnSuccess_When_ValidRequest()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "meet-123";
		var currentDate = new DateTime(2025, 11, 17, 10, 0, 0);
		var expirationDays = 30;
		var expectedExpiryDate = currentDate.AddDays(expirationDays);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			PublicLinkEnabled = false,
			PublicLinkExpiration = null
		};

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_dataProviderMock.Setup(x => x.Now).Returns(currentDate);
		_urlGeneratorMock.Setup(x => x.GeneratePublicMeetingUrl(
			_organizationOptions.ServiceBaseUrl,
			meetingId,
			meetId))
			.Returns("https://service.test.com/public/meet-123");

		var command = new PublicMeetingUrlCommand(meetingId, expirationDays);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.NotNull(result.Data);
		Assert.Equal("https://service.test.com/public/meet-123", result.Data.Link);
		Assert.Equal(expectedExpiryDate, result.Data.ExpiryDate);
		Assert.True(meeting.PublicLinkEnabled);
		Assert.Equal(expectedExpiryDate, meeting.PublicLinkExpiration);

		_dbContextMock.Verify(
			x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
			Times.Once);
		_urlGeneratorMock.Verify(
			x => x.GeneratePublicMeetingUrl(
				_organizationOptions.ServiceBaseUrl,
				meetingId,
				meetId),
			Times.Once);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_OrganizationOptionsIsNull()
	{
		var meetingId = Guid.NewGuid();
		_optionsMock.Setup(x => x.Value).Returns((OrganizationOptions)null);

		var handlerWithNullOptions = new GetMeetingUrlCommandHandler(
			_urlGeneratorMock.Object,
			_dbContextMock.Object,
			_dataProviderMock.Object,
			_optionsMock.Object);

		var command = new PublicMeetingUrlCommand(meetingId, 30);

		var result = await handlerWithNullOptions.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("BaseUrl Of Service is not set.", result.Error.Description);
		_dbContextMock.Verify(x => x.Set<Meeting>(), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Theory]
	[InlineData(null)]
	[InlineData("")]
	public async Task Should_ReturnFailure_When_ServiceBaseUrlIsNullOrEmpty(string invalidBaseUrl)
	{
		var meetingId = Guid.NewGuid();
		var invalidOptions = new OrganizationOptions
		{
			ServiceBaseUrl = invalidBaseUrl
		};
		var invalidOptionsMock = new Mock<IOptions<OrganizationOptions>>();
		invalidOptionsMock.Setup(x => x.Value).Returns(invalidOptions);

		var handlerWithInvalidOptions = new GetMeetingUrlCommandHandler(
			_urlGeneratorMock.Object,
			_dbContextMock.Object,
			_dataProviderMock.Object,
			invalidOptionsMock.Object);

		var command = new PublicMeetingUrlCommand(meetingId, 30);

		var result = await handlerWithInvalidOptions.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("BaseUrl Of Service is not set.", result.Error.Description);
		_dbContextMock.Verify(x => x.Set<Meeting>(), Times.Never);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingDoesNotExist()
	{
		var meetingId = Guid.NewGuid();

		var meetings = new List<Meeting>();
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);

		var command = new PublicMeetingUrlCommand(meetingId, 30);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("No meeting with this ID was found.", result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
		_urlGeneratorMock.Verify(
			x => x.GeneratePublicMeetingUrl(
				It.IsAny<string>(),
				It.IsAny<Guid>(),
				It.IsAny<string>()),
			Times.Never);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_SaveChangesFails()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "meet-123";

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			PublicLinkEnabled = false
		};

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Failure(Error.Failure("Database error")));
		_dataProviderMock.Setup(x => x.Now).Returns(DateTime.UtcNow);

		var command = new PublicMeetingUrlCommand(meetingId, 30);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("Failed to save changes. Please try again later.", result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
		_urlGeneratorMock.Verify(
			x => x.GeneratePublicMeetingUrl(
				It.IsAny<string>(),
				It.IsAny<Guid>(),
				It.IsAny<string>()),
			Times.Never);
	}

	[Theory]
	[InlineData(30)]
	[InlineData(60)]
	[InlineData(90)]
	public async Task Should_SetCorrectExpirationDate_When_DifferentExpirationDaysProvided(int expirationDays)
	{
		var meetingId = Guid.NewGuid();
		var meetId = "meet-456";
		var currentDate = new DateTime(2025, 1, 1, 12, 0, 0);
		var expectedExpiryDate = currentDate.AddDays(expirationDays);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			PublicLinkEnabled = false
		};

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_dataProviderMock.Setup(x => x.Now).Returns(currentDate);
		_urlGeneratorMock.Setup(x => x.GeneratePublicMeetingUrl(
			It.IsAny<string>(),
			It.IsAny<Guid>(),
			It.IsAny<string>()))
			.Returns("https://service.test.com/public/meet-456");

		var command = new PublicMeetingUrlCommand(meetingId, expirationDays);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(expectedExpiryDate, result.Data.ExpiryDate);
		Assert.Equal(expectedExpiryDate, meeting.PublicLinkExpiration);
	}

	[Fact]
	public async Task Should_EnablePublicLink_When_MeetingLinkWasDisabled()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "meet-789";
		var currentDate = DateTime.UtcNow;

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			PublicLinkEnabled = false,
			PublicLinkExpiration = null
		};

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_dataProviderMock.Setup(x => x.Now).Returns(currentDate);
		_urlGeneratorMock.Setup(x => x.GeneratePublicMeetingUrl(
			It.IsAny<string>(),
			It.IsAny<Guid>(),
			It.IsAny<string>()))
			.Returns("https://service.test.com/public/meet-789");

		Assert.False(meeting.PublicLinkEnabled);

		var command = new PublicMeetingUrlCommand(meetingId, 30);
		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(meeting.PublicLinkEnabled);
	}

	[Fact]
	public async Task Should_UpdateExistingLink_When_MeetingAlreadyHasPublicLink()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "meet-update";
		var currentDate = new DateTime(2025, 11, 17);
		var oldExpiryDate = new DateTime(2025, 10, 1);

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			PublicLinkEnabled = true,
			PublicLinkExpiration = oldExpiryDate
		};

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_dataProviderMock.Setup(x => x.Now).Returns(currentDate);
		_urlGeneratorMock.Setup(x => x.GeneratePublicMeetingUrl(
			It.IsAny<string>(),
			It.IsAny<Guid>(),
			It.IsAny<string>()))
			.Returns("https://service.test.com/public/meet-update");

		var command = new PublicMeetingUrlCommand(meetingId, 60);
		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.True(meeting.PublicLinkEnabled);
		Assert.NotEqual(oldExpiryDate, meeting.PublicLinkExpiration);
		Assert.Equal(currentDate.AddDays(60), meeting.PublicLinkExpiration);
	}

	[Fact]
	public async Task Should_GenerateCorrectUrl_When_UrlGeneratorIsCalled()
	{
		var meetingId = Guid.NewGuid();
		var meetId = "meet-url-test";
		var baseUrl = "https://custom.service.com";
		var expectedUrl = $"{baseUrl}/public/{meetingId}/{meetId}";

		_organizationOptions.ServiceBaseUrl = baseUrl;

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = meetId,
			PublicLinkEnabled = false
		};

		var meetings = new List<Meeting> { meeting };
		var meetingDbSet = meetings.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<Meeting>()).Returns(meetingDbSet.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(Result.Success());
		_dataProviderMock.Setup(x => x.Now).Returns(DateTime.UtcNow);
		_urlGeneratorMock.Setup(x => x.GeneratePublicMeetingUrl(baseUrl, meetingId, meetId))
			.Returns(expectedUrl);

		var command = new PublicMeetingUrlCommand(meetingId, 30);
		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.True(result.IsSuccess);
		Assert.Equal(expectedUrl, result.Data.Link);
		_urlGeneratorMock.Verify(
			x => x.GeneratePublicMeetingUrl(baseUrl, meetingId, meetId),
			Times.Once);
	}
}
