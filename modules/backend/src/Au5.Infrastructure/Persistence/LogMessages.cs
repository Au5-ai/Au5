using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Persistence;

public static partial class LogMessages
{
	[LoggerMessage(EventId = 0, Level = LogLevel.Error, Message = "DataBase Exception")]
	public static partial void LogDatabaseException(this ILogger logger, Exception exception);

	[LoggerMessage(EventId = 1, Level = LogLevel.Error, Message = "Initializing Database - {message}")]
	public static partial void LogDatabaseInitializationException(this ILogger logger, string message, Exception exception);

	[LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Initializing Database - {message}")]
	public static partial void LogDatabaseInitializationInfo(this ILogger logger, string message);
}
