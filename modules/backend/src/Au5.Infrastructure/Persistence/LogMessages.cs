using Microsoft.Extensions.Logging;

namespace Au5.Infrastructure.Persistence;

public static partial class LogMessages
{
	private static readonly Action<ILogger, Exception> _databaseException =
		LoggerMessage.Define(LogLevel.Error, new EventId(0, "DatabaseException"), "DataBase_Exception");

	public static void LogDatabaseException(this ILogger logger, Exception exception)
	{
		_databaseException(logger, exception);
	}
}
