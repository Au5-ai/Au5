using Au5.Application.Features.Meetings.Rename;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.Rename
{
	public class RenameMeetingCommandValidatorTests
	{
		private readonly RenameMeetingCommandValidator _validator = new();

		[Theory]
		[InlineData("00000000-0000-0000-0000-000000000000", "Interview Meet")]
		[InlineData("12e1c2b4-9a61-4f3f-b4a2-1a22a1c5d7f8", null)]
		[InlineData("00000000-0000-0000-0000-000000000000", "")]
		public void Should_ReturnValidationError_When_FieldIsEmptyOrNull(string meetingId, string newName)
		{
			var command = new RenameMeetingCommand(Guid.Parse(meetingId), newName);

			var result = _validator.TestValidate(command);

			result.ShouldHaveValidationErrors()
				.WithErrorMessage(AppResources.Validation.Required);
		}

		[Fact]
		public void Should_NotReturnValidationError_When_RequestIsCorrectl()
		{
			var command = new RenameMeetingCommand(Guid.NewGuid(), "Interview Meet");
			var result = _validator.TestValidate(command);

			result.ShouldNotHaveAnyValidationErrors();
		}
	}
}
