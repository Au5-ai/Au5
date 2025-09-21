namespace Au5.Shared;

public interface IDateTimeProvider
{
    DateTime Now { get; }
}

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
}
