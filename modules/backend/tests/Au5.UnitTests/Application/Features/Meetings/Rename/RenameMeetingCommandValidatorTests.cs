using Au5.Application.Features.Meetings.Rename;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.Rename
{
	public class RenameMeetingCommandValidatorTests
	{
		private readonly RenameMeetingCommandValidator _validator = new();

		[Theory]
		[InlineData("", "Interview Meet")]
		[InlineData(null, "Interview Meet")]
		[InlineData("12", "")]
		[InlineData("12", null)]
		[InlineData("", "")]
		[InlineData(null, null)]
		public void Should_ReturnValidationError_When_FieldIsEmptyOrNull(string meetId, string newName)
		{
			var command = new RenameMeetingCommand(meetId, newName);

			var result = _validator.TestValidate(command);

			result.ShouldHaveValidationErrors()
				.WithErrorMessage(AppResources.Validation.Required);
		}

		[Fact]
		public void Should_NotReturnValidationError_When_RequestIsCorrectl()
		{
			var command = new RenameMeetingCommand("1", "Interview Meet");
			var result = _validator.TestValidate(command);

			result.ShouldNotHaveAnyValidationErrors();
		}
	}
}
