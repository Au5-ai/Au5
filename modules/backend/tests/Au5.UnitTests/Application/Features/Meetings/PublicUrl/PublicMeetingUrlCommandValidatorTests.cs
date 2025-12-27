using Au5.Application.Features.Meetings.PublicUrl;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.PublicUrl;

public class PublicMeetingUrlCommandValidatorTests
{
	private readonly PublicMeetingUrlCommandValidator _validator = new();

	[Fact]
	public void Should_ReturnValidationError_When_MeetingIdIsEmpty()
	{
		var command = new PublicMeetingUrlCommand(Guid.Empty, 30);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.MeetingId)
			.WithErrorMessage(AppResources.Validation.Required);
	}

	[Theory]
	[InlineData(0)]
	[InlineData(1)]
	[InlineData(6)]
	[InlineData(8)]
	[InlineData(29)]
	[InlineData(31)]
	[InlineData(44)]
	[InlineData(46)]
	[InlineData(59)]
	[InlineData(60)]
	[InlineData(90)]
	[InlineData(100)]
	[InlineData(120)]
	[InlineData(-1)]
	[InlineData(-30)]
	public void Should_ReturnValidationError_When_ExpirationDaysIsNotValid(int invalidDays)
	{
		var command = new PublicMeetingUrlCommand(Guid.NewGuid(), invalidDays);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.ExpirationDays)
			.WithErrorMessage("ExpirationDays must be one of the following values: 7, 30, or 45.");
	}

	[Theory]
	[InlineData(7)]
	[InlineData(30)]
	[InlineData(45)]
	public void Should_NotReturnValidationError_When_ExpirationDaysIsValid(int validDays)
	{
		var command = new PublicMeetingUrlCommand(Guid.NewGuid(), validDays);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveValidationErrorFor(x => x.ExpirationDays);
	}

	[Fact]
	public void Should_NotReturnValidationError_When_RequestIsCorrect()
	{
		var command = new PublicMeetingUrlCommand(Guid.NewGuid(), 30);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}

	[Theory]
	[InlineData(7)]
	[InlineData(30)]
	[InlineData(45)]
	public void Should_NotReturnValidationError_When_AllValidCombinationsAreTested(int expirationDays)
	{
		var command = new PublicMeetingUrlCommand(Guid.NewGuid(), expirationDays);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}
}
