using Au5.Application.Features.Meetings.AddBot;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.AddBot;

public class AddBotCommandValiadtorTests
{
	private readonly AddBotCommandValiadtor _validator = new();

	[Theory]
	[InlineData("", "Platform")]
	[InlineData(null, "Platform")]
	[InlineData("", "MeetId")]
	[InlineData(null, "MeetId")]
	public void Should_ReturnValidationError_When_FieldIsEmptyOrNull(string invalidValue, string propertyName)
	{
		var command = propertyName switch
		{
			"Platform" => new AddBotCommand(invalidValue!, "MeetId"),
			"MeetId" => new AddBotCommand("TestPlatform", invalidValue!),
			_ => throw new ArgumentException("Unknown property", nameof(propertyName))
		};

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(propertyName)
			.WithErrorMessage(AppResources.Validation.Required);
	}

	[Fact]
	public void Should_NotReturnValidationError_When_RequestIsCorrectl()
	{
		var command = new AddBotCommand("TestPlatform", "MeetId");
		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}
}
