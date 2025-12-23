using Au5.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;
using Au5.Domain.Entities;
using Au5.Shared;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.MeetingSpaces.RemoveMeetingFromSpace;

public class RemoveMeetingFromSpaceCommandHandlerTestFixture
{
	public Mock<IApplicationDbContext> MockDbContext { get; } = new();

	public RemoveMeetingFromSpaceCommandHandler Handler { get; private set; }

	public MeetingSpace TestMeetingSpace { get; private set; }

	public List<MeetingSpace> TestMeetingSpaces { get; private set; } = [];

	public Guid TestMeetingId { get; } = Guid.NewGuid();

	public Guid TestSpaceId { get; } = Guid.NewGuid();

	public RemoveMeetingFromSpaceCommandHandlerTestFixture WithExistingMeetingSpace()
	{
		var now = DateTime.Parse("2025-01-15T10:00:00");

		TestMeetingSpace = new MeetingSpace
		{
			MeetingId = TestMeetingId,
			SpaceId = TestSpaceId,
			UserId = Guid.NewGuid(),
			CreatedAt = now
		};

		TestMeetingSpaces = [TestMeetingSpace];
		var meetingSpaceDbSet = TestMeetingSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<MeetingSpace>()).Returns(meetingSpaceDbSet.Object);

		return this;
	}

	public RemoveMeetingFromSpaceCommandHandlerTestFixture WithNoMeetingSpace()
	{
		var meetingSpaceDbSet = TestMeetingSpaces.BuildMockDbSet();
		MockDbContext.Setup(db => db.Set<MeetingSpace>()).Returns(meetingSpaceDbSet.Object);

		return this;
	}

	public RemoveMeetingFromSpaceCommandHandlerTestFixture WithSuccessfulSave()
	{
		MockDbContext.Setup(db => db.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());
		return this;
	}

	public RemoveMeetingFromSpaceCommandHandler BuildHandler()
	{
		Handler = new RemoveMeetingFromSpaceCommandHandler(MockDbContext.Object);
		return Handler;
	}

	public RemoveMeetingFromSpaceCommand CreateCommand()
	{
		return new RemoveMeetingFromSpaceCommand(TestMeetingId, TestSpaceId);
	}

	public RemoveMeetingFromSpaceCommand CreateCommand(Guid meetingId, Guid spaceId)
	{
		return new RemoveMeetingFromSpaceCommand(meetingId, spaceId);
	}
}
