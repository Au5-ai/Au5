namespace Au5.Shared;

public interface IResult
{
	bool IsSuccess { get; }

	Error Error { get; }

	object GetData();
}
