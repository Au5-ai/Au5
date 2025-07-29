using Au5.BackEnd.GlobalHandler;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;

namespace Au5.UnitTests.BackEnd.GlobalHandler;

public class ValidationExceptionHandlerTests
{
	private readonly Mock<IProblemDetailsService> _problemDetailsServiceMock = new();
	private readonly ValidationExceptionHandler _handler;

	public ValidationExceptionHandlerTests()
	{
		_handler = new ValidationExceptionHandler(_problemDetailsServiceMock.Object);
	}

	[Fact]
	public async Task Should_NotHandle_When_ExceptionIsNotValidationException()
	{
		var context = new DefaultHttpContext();
		var result = await _handler.TryHandleAsync(context, new Exception("Some error"), CancellationToken.None);

		Assert.False(result);
	}

	[Fact]
	public async Task Should_HandleAndWriteProblemDetails_When_ExceptionIsValidationException()
	{
		var context = new DefaultHttpContext();
		var failures = new List<ValidationFailure>
		{
			new("Field1", "Field1 is required"),
			new("Field1", "Field1 must be a string"),
			new("Field2", "Field2 must be a number")
		};
		var exception = new ValidationException(failures);

		_problemDetailsServiceMock
			.Setup(x => x.TryWriteAsync(It.IsAny<ProblemDetailsContext>()))
			.ReturnsAsync(true);

		var result = await _handler.TryHandleAsync(context, exception, CancellationToken.None);

		Assert.True(result);

		Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);

		_problemDetailsServiceMock.Verify(
			x => x.TryWriteAsync(It.Is<ProblemDetailsContext>(ctx =>
			ctx.ProblemDetails.Extensions.ContainsKey("errors") &&
			((Dictionary<string, string[]>)ctx.ProblemDetails.Extensions["errors"])["Field1"].Length == 2 &&
			((Dictionary<string, string[]>)ctx.ProblemDetails.Extensions["errors"])["Field2"].Length == 1)), Times.Once);
	}
}
