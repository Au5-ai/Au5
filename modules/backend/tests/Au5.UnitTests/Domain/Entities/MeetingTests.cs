using Au5.Domain.Entities;

namespace Au5.UnitTests.Domain.Entities;

public class MeetingTests
{
	[Fact]
	public void IsActive_Should_ReturnsTrue_When_StatusIsRecording()
	{
		var meeting = new Meeting { Status = MeetingStatus.Recording };

		var result = meeting.IsActive();

		Assert.True(result);
	}

	[Fact]
	public void IsActive_Should_ReturnsTrue_When_StatusIsPaused()
	{
		var meeting = new Meeting { Status = MeetingStatus.Paused };

		var result = meeting.IsActive();

		Assert.True(result);
	}

	[Theory]
	[InlineData(MeetingStatus.AddingBot)]
	[InlineData(MeetingStatus.Ended)]
	public void IsActive_Should_ReturnsFalse_When_StatusIsNotActive(MeetingStatus status)
	{
		var meeting = new Meeting { Status = status };

		var result = meeting.IsActive();

		Assert.False(result);
	}

	[Fact]
	public void IsPaused_Should_ReturnsTrue_When_StatusIsPaused()
	{
		var meeting = new Meeting { Status = MeetingStatus.Paused };

		var result = meeting.IsPaused();

		Assert.True(result);
	}

	[Theory]
	[InlineData(MeetingStatus.Recording)]
	[InlineData(MeetingStatus.Ended)]
	public void IsPaused_Should_ReturnsFalse_When_StatusIsNotPaused(MeetingStatus status)
	{
		var meeting = new Meeting { Status = status };

		var result = meeting.IsPaused();

		Assert.False(result);
	}

	[Fact]
	public void IsRecording_Should_ReturnsTrue_When_StatusIsRecording()
	{
		var meeting = new Meeting { Status = MeetingStatus.Recording };

		var result = meeting.IsRecording();

		Assert.True(result);
	}

	[Fact]
	public void IsRecording_Should_ReturnsFalse_When_StatusIsNotRecording()
	{
		var meeting = new Meeting { Status = MeetingStatus.Ended };

		var result = meeting.IsRecording();

		Assert.False(result);
	}

	[Fact]
	public void IsEnded_Should_ReturnsTrue_When_StatusIsEnded()
	{
		var meeting = new Meeting { Status = MeetingStatus.Ended };

		var result = meeting.IsEnded();

		Assert.True(result);
	}

	[Fact]
	public void IsEnded_Should_ReturnsFalse_When_StatusIsNotEnded()
	{
		var meeting = new Meeting { Status = MeetingStatus.Paused };

		var result = meeting.IsEnded();

		Assert.False(result);
	}
}
