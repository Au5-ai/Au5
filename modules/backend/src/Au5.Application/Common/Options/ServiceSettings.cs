namespace Au5.Application.Common.Options;

public class ServiceSettings
{
	public const string SectionName = "ServiceSettings";

	public bool UseRedis { get; set; } = false;

	public int TokenCleanupIntervalMinutes { get; set; } = 60;
}
