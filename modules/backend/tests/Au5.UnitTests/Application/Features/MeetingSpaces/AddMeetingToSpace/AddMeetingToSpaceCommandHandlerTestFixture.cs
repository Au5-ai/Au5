using Au5.Application.Features.MeetingSpaces.AddMeetingToSpace;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.MeetingSpaces.AddMeetingToSpace;

public class AddMeetingToSpaceCommandHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public Mock<ICurrentUserService> MockCurrentUserService { get; } = new();

	public AddMeetingToSpaceCommandHandler Handler { get; private set; }

	public Meeting TestMeeting { get; private set; }

	public Space TestSpace { get; private set; }

	public List<MeetingSpace> TestMeetingSpaces { get; private set; } = [];

	public Guid TestUserId { get; } = Guid.NewGuid();

	public AddMeetingToSpaceCommandHandlerTestFixture WithValidMeeting()
	{
		TestMeeting = new Meeting
		{
			Id = Guid.NewGuid(),
			MeetId = "test-meet-id",
			MeetName = "Test Meeting",
			Status = MeetingStatus.Recording
		};

		var meetingDbSet = new List<Meeting> { TestMeeting }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithNoMeeting()
	{
		var meetingDbSet = new List<Meeting>().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Meeting>()).Returns(meetingDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithValidSpace()
	{
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Test Space",
			Description = "Test Description",
			IsActive = true
		};

		var spaceDbSet = new List<Space> { TestSpace }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithInactiveSpace()
	{
		TestSpace = new Space
		{
			Id = Guid.NewGuid(),
			Name = "Inactive Space",
			Description = "Inactive Description",
			IsActive = false
		};

		var spaceDbSet = new List<Space> { TestSpace }.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithNoSpace()
	{
		var spaceDbSet = new List<Space>().BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<Space>()).Returns(spaceDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithExistingMeetingSpace()
	{
		TestMeetingSpaces =
		[
			new MeetingSpace
			{
				MeetingId = TestMeeting?.Id ?? Guid.NewGuid(),
				SpaceId = TestSpace?.Id ?? Guid.NewGuid(),
				UserId = TestUserId,
				CreatedAt = DateTime.UtcNow
			}

		];

		var meetingSpaceDbSet = TestMeetingSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<MeetingSpace>()).Returns(meetingSpaceDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithNoExistingMeetingSpace()
	{
		var meetingSpaceDbSet = TestMeetingSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<MeetingSpace>()).Returns(meetingSpaceDbSet.Object);

		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithCurrentUser()
	{
		MockCurrentUserService.Setup(s => s.UserId).Returns(TestUserId);
		return this;
	}

	public AddMeetingToSpaceCommandHandlerTestFixture WithSuccessfulSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());
		return this;
	}

	public AddMeetingToSpaceCommandHandler BuildHandler()
	{
		Handler = new AddMeetingToSpaceCommandHandler(MockDbContext.Object, MockCurrentUserService.Object);
		return Handler;
	}

	public AddMeetingToSpaceCommand CreateCommand()
	{
		return new AddMeetingToSpaceCommand(TestMeeting?.Id ?? Guid.NewGuid(), TestSpace?.Id ?? Guid.NewGuid());
	}

	public AddMeetingToSpaceCommand CreateCommand(Guid meetingId, Guid spaceId)
	{
		return new AddMeetingToSpaceCommand(meetingId, spaceId);
	}
}
