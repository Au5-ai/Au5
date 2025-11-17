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
}
