using Au5.Application.Common.Options;
using Au5.Application.Features.Meetings.CloseMeetingByUser;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.CloseMeetingByUser;
public class CloseMeetingByUserCommandHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IMeetingService> _meetingServiceMock;
	private readonly Mock<IBotFatherAdapter> _botFatherAdapter;
	private readonly Mock<ICurrentUserService> _currentUserServiceMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly Mock<IOptions<OrganizationOptions>> _options;
	private readonly CloseMeetingByUserCommandHandler _handler;

	public CloseMeetingByUserCommandHandlerTests()
	{
		_dbContextMock = new();
		_meetingServiceMock = new();
		_botFatherAdapter = new();
		_currentUserServiceMock = new();
		_dataProviderMock = new();
		_options = new();
		_handler = new CloseMeetingByUserCommandHandler(_dbContextMock.Object, _meetingServiceMock.Object, _botFatherAdapter.Object, _currentUserServiceMock.Object, _dataProviderMock.Object, _options.Object);
	}

	[Fact]
	public async Task Should_ReturnFailure_When_ThereIsNoConfigs()
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		var meeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "meet-4",
			Status = MeetingStatus.AddingBot,
			CreatedAt = now.AddHours(-2)
		};

		var meetingDbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		var configDbSet = new List<Organization>().BuildMockDbSet();

		_dbContextMock.Setup(db => db.Set<Organization>()).Returns(configDbSet.Object);
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		var meetingContent = new Meeting
		{
			Entries = [],
			Participants = [],
			Guests = []
		};
		var command = new CloseMeetingByUserCommand(meeting.Id);

		var result = await _handler.Handle(command, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal(AppResources.System.IsNotConfigured, result.Error.Description);
		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
		_botFatherAdapter.Verify(x => x.RemoveBotContainerAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
	}
}
