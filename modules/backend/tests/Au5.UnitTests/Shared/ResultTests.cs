using Au5.Shared;

namespace Au5.UnitTests.Shared;

public class ResultTests
{
	[Fact]
	public void Should_CreateSuccessResult_When_DataIsProvided()
	{
		var expected = "test-data";
		Result<string> result = expected;

		Assert.True(result.IsSuccess);
		Assert.False(result.IsFailure);
		Assert.Equal(expected, result.Data);
	}

	[Fact]
	public void Should_CreateFailureResult_When_ErrorIsProvided()
	{
		var error = Error.Unauthorized("Invalid credentials");

		Result<string> result = error;

		Assert.True(result.IsFailure);
		Assert.False(result.IsSuccess);
		Assert.Equal(error, result.Error);
		Assert.Null(result.Data);
	}

	[Fact]
	public void Should_ReturnDataOnlyIfSuccess()
	{
		Result<string> successResult = "OK";
		Result<string> failureResult = Error.NotFound();

		Assert.Equal("OK", successResult.Data);
		Assert.Null(failureResult.Data);
	}

	[Fact]
	public void Should_GetData_ReturnNonNullEvenIfNullable()
	{
		Result<string> result = "something";

		var data = result.GetData();

		Assert.NotNull(data);
		Assert.IsType<string>(data);
		Assert.Equal("something", data);
	}
}
