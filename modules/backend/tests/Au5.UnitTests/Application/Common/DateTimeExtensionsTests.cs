using Au5.Application.Common;

namespace Au5.UnitTests.Application.Common;

public class DateTimeExtensionsTests
{
	[Fact]
	public void DiffTo_ShouldReturnCorrectTimeSpan_WhenEndIsAfterStart()
	{
		var start = new DateTime(2025, 12, 13, 1, 10, 55);
		var end = new DateTime(2025, 12, 13, 2, 50, 8);

		var result = start.DiffTo(end);

		Assert.Equal(1, result.Hours);
		Assert.Equal(39, result.Minutes);
		Assert.Equal(13, result.Seconds);
	}

	[Fact]
	public void DiffTo_ShouldReturnNegativeTimeSpan_WhenEndIsBeforeStart()
	{
		var start = new DateTime(2025, 12, 13, 2, 50, 8);
		var end = new DateTime(2025, 12, 13, 1, 10, 55);

		var result = start.DiffTo(end);

		Assert.True(result.TotalSeconds < 0);
		Assert.Equal(-1, result.Hours);
		Assert.Equal(-39, result.Minutes);
	}

	[Fact]
	public void DiffTo_ShouldReturnZeroTimeSpan_WhenStartEqualsEnd()
	{
		var dateTime = new DateTime(2025, 12, 13, 1, 10, 55);

		var result = dateTime.DiffTo(dateTime);

		Assert.Equal(TimeSpan.Zero, result);
	}

	[Theory]
	[InlineData(0, 0, 30, "30s")]
	[InlineData(0, 0, 45, "45s")]
	[InlineData(0, 0, 59, "59s")]
	public void ToReadableString_ShouldReturnSeconds_WhenLessThanOneMinute(int hours, int minutes, int seconds, string expected)
	{
		var timeSpan = new TimeSpan(hours, minutes, seconds);

		var result = timeSpan.ToReadableString();

		Assert.Equal(expected, result);
	}

	[Theory]
	[InlineData(0, 1, 0, "1m")]
	[InlineData(0, 15, 30, "15m")]
	[InlineData(0, 30, 0, "30m")]
	[InlineData(0, 59, 59, "59m")]
	public void ToReadableString_ShouldReturnMinutes_WhenLessThanOneHour(int hours, int minutes, int seconds, string expected)
	{
		var timeSpan = new TimeSpan(hours, minutes, seconds);

		var result = timeSpan.ToReadableString();

		Assert.Equal(expected, result);
	}

	[Theory]
	[InlineData(1, 0, 0, "1h 0m")]
	[InlineData(1, 30, 0, "1h 30m")]
	[InlineData(2, 15, 45, "2h 15m")]
	[InlineData(5, 45, 30, "5h 45m")]
	[InlineData(23, 59, 59, "23h 59m")]
	public void ToReadableString_ShouldReturnHoursAndMinutes_WhenLessThanOneDay(int hours, int minutes, int seconds, string expected)
	{
		var timeSpan = new TimeSpan(hours, minutes, seconds);

		var result = timeSpan.ToReadableString();

		Assert.Equal(expected, result);
	}

	[Theory]
	[InlineData(1, 0, 0, 0, "1d 0h 0m")]
	[InlineData(1, 5, 30, 0, "1d 5h 30m")]
	[InlineData(2, 12, 45, 30, "2d 12h 45m")]
	[InlineData(7, 3, 15, 0, "7d 3h 15m")]
	public void ToReadableString_ShouldReturnDaysHoursAndMinutes_WhenOneOrMoreDays(int days, int hours, int minutes, int seconds, string expected)
	{
		var timeSpan = new TimeSpan(days, hours, minutes, seconds);

		var result = timeSpan.ToReadableString();

		Assert.Equal(expected, result);
	}

	[Fact]
	public void ToReadableString_ShouldHandleSpecificCase_FromUserRequirement()
	{
		var start = new DateTime(2025, 12, 13, 1, 10, 55, 213);
		var end = new DateTime(2025, 12, 13, 2, 50, 8, 187);

		var timeSpan = start.DiffTo(end);
		var result = timeSpan.ToReadableString();

		Assert.Equal("1h 39m", result);
	}

	[Fact]
	public void ToReadableString_ShouldHandleZeroTimeSpan()
	{
		var timeSpan = TimeSpan.Zero;

		var result = timeSpan.ToReadableString();

		Assert.Equal("0s", result);
	}

	[Fact]
	public void ToReadableString_ShouldHandleVeryLargeTimeSpan()
	{
		var timeSpan = new TimeSpan(365, 12, 30, 45);

		var result = timeSpan.ToReadableString();

		Assert.Equal("365d 12h 30m", result);
	}

	[Theory]
	[InlineData(0, 0, 0, 500)]
	[InlineData(0, 0, 0, 999)]
	public void ToReadableString_ShouldReturnZeroSeconds_WhenOnlyMilliseconds(int hours, int minutes, int seconds, int milliseconds)
	{
		var timeSpan = new TimeSpan(0, hours, minutes, seconds, milliseconds);

		var result = timeSpan.ToReadableString();

		Assert.Equal("0s", result);
	}

	[Fact]
	public void DiffTo_ShouldWorkWithPreciseMilliseconds()
	{
		var start = new DateTime(2025, 12, 13, 1, 10, 55, 213, 897, DateTimeKind.Utc);
		var end = new DateTime(2025, 12, 13, 2, 50, 8, 187, 920, DateTimeKind.Utc);

		var result = start.DiffTo(end);

		Assert.Equal(1, result.Hours);
		Assert.Equal(39, result.Minutes);
		Assert.Equal(12, result.Seconds);
		Assert.True(result.Milliseconds >= 974 && result.Milliseconds <= 975);
	}

	[Fact]
	public void ToReadableString_ShouldRoundDownMinutes()
	{
		var timeSpan = new TimeSpan(0, 5, 59);

		var result = timeSpan.ToReadableString();

		Assert.Equal("5m", result);
	}

	[Fact]
	public void ToReadableString_ShouldRoundDownHours()
	{
		var timeSpan = new TimeSpan(2, 59, 59);

		var result = timeSpan.ToReadableString();

		Assert.Equal("2h 59m", result);
	}
}
