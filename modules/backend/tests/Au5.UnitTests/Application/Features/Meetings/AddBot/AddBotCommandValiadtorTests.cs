using Au5.Application.Features.Meetings.AddBot;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.AddBot;

public class AddBotCommandValiadtorTests
{
	private const string RequiredMessage = "property can not be empty";
	private readonly AddBotCommandValiadtor _validator = new();

	[Theory]
	[InlineData("", "BotName")]
	[InlineData(null, "BotName")]
	[InlineData("", "Platform")]
	[InlineData(null, "Platform")]
	[InlineData("", "MeetId")]
	[InlineData(null, "MeetId")]
	public void Should_ReturnValidationError_When_FieldIsEmptyOrNull(string invalidValue, string propertyName)
	{
		var command = propertyName switch
		{
			"BotName" => new AddBotCommand("TestPlatform", invalidValue!, "MeetId"),
			"Platform" => new AddBotCommand(invalidValue!, "BotName", "MeetId"),
			"MeetId" => new AddBotCommand("TestPlatform", "BotName", invalidValue!),
			_ => throw new ArgumentException("Unknown property", nameof(propertyName))
		};

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(propertyName)
			.WithErrorMessage(RequiredMessage);
	}

	[Fact]
	public void Should_NotReturnValidationError_When_RequestIsCorrectl()
	{
		var command = new AddBotCommand("TestPlatform", "BotName", "MeetId");
		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}
}
