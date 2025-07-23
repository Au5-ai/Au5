using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Persistence;

public static partial class LogMessages
{
	[LoggerMessage(EventId = 0, Level = LogLevel.Error, Message = "DataBase Exception ({@exception})")]
	public static partial void LogDatabaseException(this ILogger logger, Exception exception);

	[LoggerMessage(EventId = 0, Level = LogLevel.Information, Message = "Initializing Database Encountered Exception - {message}({@exception})")]
	public static partial void LogDatabaseInitializationException(this ILogger logger, string message, Exception exception);

	[LoggerMessage(EventId = 0, Level = LogLevel.Information, Message = "{message}")]
	public static partial void LogDatabaseInitializationInfo(this ILogger logger, string message);
}
