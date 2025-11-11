using Au5.Application.Features.Meetings.GetSystemMeetingUrl;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.GetSystemMeetingUrl
{
	public class GetSystemMeetingUrlCommandValidatorTests
	{
		private readonly GetMeetingUrlCommandValidator _validator = new();

		[Theory]
		[InlineData(null, "30")]
		[InlineData("", "30")]
		[InlineData("8e0fde5b-352b-44d0-8e11-05ca9b4b6862", "25")]
		[InlineData("8e0fde5b-352b-44d0-8e11-05ca9b4b6862", "0")]

		public void Should_ReturnValidationError_When_FieldIsEmptyOrNull(string meetingIdStr, string expirationDaysStr)
		{
			var meetingId = Guid.TryParse(meetingIdStr, out var parsedGuid) ? parsedGuid : Guid.Empty;
			var expirationDays = int.Parse(expirationDaysStr);

			var command = new GetMeetingUrlCommand(meetingId, expirationDays);

			var result = _validator.TestValidate(command);

			if (meetingId == Guid.Empty)
			{
				result.ShouldHaveValidationErrorFor(c => c.MeetingId)
					  .WithErrorMessage(AppResources.Validation.Required);
			}

			if (expirationDays is not 30 and not 60 and not 90)
			{
				result.ShouldHaveValidationErrorFor(c => c.ExpirationDays)
					  .WithErrorMessage("ExpirationDays must be one of the following values: 30, 60, or 90.");
			}
		}

		[Theory]
		[InlineData("8e0fde5b-352b-44d0-8e11-05ca9b4b6862", "30")]
		[InlineData("8e0fde5b-352b-44d0-8e11-05ca9b4b6862", "60")]
		[InlineData("8e0fde5b-352b-44d0-8e11-05ca9b4b6862", "90")]
		public void Should_NotReturnValidationError_When_RequestIsCorrectly(string meetingIdStr, string expirationDaysStr)
		{
			var meetingId = Guid.TryParse(meetingIdStr, out var parsedGuid) ? parsedGuid : Guid.Empty;
			var expirationDays = int.Parse(expirationDaysStr);

			var command = new GetMeetingUrlCommand(meetingId, expirationDays);

			var result = _validator.TestValidate(command);

			result.ShouldNotHaveAnyValidationErrors();
		}
	}
}
