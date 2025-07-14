using System.Text.Json.Serialization;

namespace Au5.Shared;

public readonly record struct Result
{
	private readonly Error _error;

	[JsonIgnore]
	public bool IsSuccess => _error.Code is null;

	[JsonIgnore]
	public bool IsFailure => !IsSuccess;

	[JsonIgnore]
	public Error Error => _error;

	private Result(Error error)
	{
		_error = error;
	}

	public static Result Failure(Error error) => new(error);

	public static Result Success() => new();

	public static implicit operator Result(Error error) => new(error);
}

public readonly record struct Result<TData> : IResult
{
	private readonly TData? _data;

	private readonly Result _baseResult;

	[JsonIgnore]
	public bool IsSuccess => _baseResult.IsSuccess;

	[JsonIgnore]
	public bool IsFailure => _baseResult.IsFailure;

	[JsonIgnore]
	public Error Error => _baseResult.Error;
	public TData? Data => IsSuccess ? _data : default;

	private Result(TData data)
	{
		_data = data;
		_baseResult = Result.Success();
	}

	private Result(Error error)
	{
		_data = default;
		_baseResult = Result.Failure(error);
	}

	public static implicit operator Result<TData>(TData data) => new(data);
	public static implicit operator Result<TData>(Error error) => new(error);

	public object GetData() => Data!;
}
