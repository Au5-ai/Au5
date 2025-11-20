namespace Au5.Application.Common;
public static class DateTimeExtensions
{
	public static TimeSpan DiffTo(this DateTime start, DateTime end)
	{
		return end - start;
	}

	public static string ToReadableString(this TimeSpan timeSpan)
	{
		if (timeSpan.TotalMinutes < 1)
		{
			return $"{timeSpan.Seconds}s";
		}

		if (timeSpan.TotalHours < 1)
		{
			return $"{timeSpan.Minutes}m";
		}

		return timeSpan.TotalDays < 1
			? $"{timeSpan.TotalHours}h {timeSpan.Minutes}m"
			: $"{timeSpan.TotalDays}d {timeSpan.Hours}h {timeSpan.Minutes}m";
	}
}
