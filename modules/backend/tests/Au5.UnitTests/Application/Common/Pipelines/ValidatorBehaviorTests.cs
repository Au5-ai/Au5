using Au5.Application.Common.Piplines;
using FluentValidation;
using FluentValidation.Results;
using Mediator;

namespace Au5.UnitTests.Application.Common.Pipelines;

// Sample request/response for testing
public record TestRequest(string Name) : IRequest<string>;

public class ValidatorBehaviorTests
{
	[Fact]
	public async Task Handle_Should_CallNext_WhenValidationPasses()
	{
		var validators = new List<IValidator<TestRequest>>
		{
			CreateValidatorReturning(new ValidationResult())
		};

		var behavior = new ValidatorBehavior<TestRequest, string>(validators);
		var expectedResponse = "OK";

		ValueTask<string> Next(TestRequest req, CancellationToken _)
		{
			return ValueTask.FromResult(expectedResponse);
		}

		var result = await behavior.Handle(new TestRequest("FakeData"), CancellationToken.None, Next);

		Assert.Equal(result, expectedResponse);
	}

	[Fact]
	public async Task Handle_Should_ThrowValidationException_WhenValidationFails()
	{
		var validationFailures = new List<ValidationFailure>
		{
			new("Name", "Name is required")
		};

		var validators = new List<IValidator<TestRequest>>
		{
			CreateValidatorReturning(new ValidationResult(validationFailures))
		};

		var behavior = new ValidatorBehavior<TestRequest, string>(validators);

		static ValueTask<string> Next(TestRequest req, CancellationToken _)
		{
			throw new InvalidOperationException("Should not be called");
		}

		async Task Act()
		{
			await behavior.Handle(new TestRequest(string.Empty), CancellationToken.None, Next);
		}

		var exception = await Assert.ThrowsAsync<ValidationException>(Act);
		Assert.Single(exception.Errors, f => f.PropertyName == "Name" && f.ErrorMessage == "Name is required");
		Assert.Contains("Command Validation Errors for type TestRequest", exception.Message);
	}

	private static IValidator<TestRequest> CreateValidatorReturning(ValidationResult result)
	{
		var mockValidator = new Mock<IValidator<TestRequest>>();
		mockValidator
			.Setup(v => v.ValidateAsync(It.IsAny<TestRequest>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(result);
		return mockValidator.Object;
	}
}
