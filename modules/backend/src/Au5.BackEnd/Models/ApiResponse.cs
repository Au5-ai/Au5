namespace Au5.BackEnd.Models;

public class ApiResponse<T>
{
    public bool IsSuccess { get; init; }

    public T Data { get; init; }

    public List<string> Errors { get; init; }

    public static ApiResponse<T> Success(T data) => new() { IsSuccess = true, Data = data };

    public static ApiResponse<T> Failure(params string[] errors) => new() { IsSuccess = false, Errors = [.. errors] };
}