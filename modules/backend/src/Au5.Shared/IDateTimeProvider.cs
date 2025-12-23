namespace Au5.Shared;

public interface IDataProvider
{
	DateTime Now { get; }

	DateTime UtcNow { get; }

	Guid NewGuid();
}

public class SystemDataProvider : IDataProvider
{
	public DateTime Now => DateTime.Now;

	public DateTime UtcNow => DateTime.UtcNow;

	public Guid NewGuid() => Guid.NewGuid();
}
