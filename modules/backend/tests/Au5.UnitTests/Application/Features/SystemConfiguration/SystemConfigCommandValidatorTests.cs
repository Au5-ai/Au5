using Au5.Application.Features.SystemConfigs.SetConfig;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.SystemConfiguration;

public class SystemConfigCommandValidatorTests
{
	private readonly SystemConfigCommandValidator _validator;

	public SystemConfigCommandValidatorTests()
	{
		_validator = new SystemConfigCommandValidator();
	}

	[Fact]
	public void Valid_Command_Should_Pass()
	{
		var model = CreateValidCommand();
		var result = _validator.TestValidate(model);
		result.ShouldNotHaveAnyValidationErrors();
	}

	[Theory]
	[InlineData(nameof(SystemConfigCommand.OrganizationName))]
	[InlineData(nameof(SystemConfigCommand.BotName))]
	[InlineData(nameof(SystemConfigCommand.PanelUrl))]
	[InlineData(nameof(SystemConfigCommand.Direction))]
	[InlineData(nameof(SystemConfigCommand.Language))]
	[InlineData(nameof(SystemConfigCommand.ServiceBaseUrl))]
	[InlineData(nameof(SystemConfigCommand.BotFatherUrl))]
	[InlineData(nameof(SystemConfigCommand.OpenAIToken))]
	[InlineData(nameof(SystemConfigCommand.HubUrl))]
	[InlineData(nameof(SystemConfigCommand.MeetingTranscriptionModel))]
	public void Missing_Required_Field_Should_Fail(string propertyName)
	{
		var model = CreateValidCommand();
		typeof(SystemConfigCommand).GetProperty(propertyName)!.SetValue(model, null);

		var result = _validator.TestValidate(model);

		result.ShouldHaveValidationErrorFor(propertyName)
			  .WithErrorMessage(AppResources.Required);
	}

	[Theory]
	[InlineData(nameof(SystemConfigCommand.PanelUrl))]
	[InlineData(nameof(SystemConfigCommand.ServiceBaseUrl))]
	[InlineData(nameof(SystemConfigCommand.BotFatherUrl))]
	[InlineData(nameof(SystemConfigCommand.HubUrl))]
	public void Invalid_Url_Should_Fail(string propertyName)
	{
		var model = CreateValidCommand();
		typeof(SystemConfigCommand).GetProperty(propertyName)!.SetValue(model, "invalid_url");

		var result = _validator.TestValidate(model);

		result.ShouldHaveValidationErrorFor(propertyName)
			  .WithErrorMessage(AppResources.InvalidUrl);
	}

	[Theory]
	[InlineData("left")]
	[InlineData("LTRS")]
	[InlineData("r")]
	public void Invalid_Direction_Should_Fail(string direction)
	{
		var model = CreateValidCommand();
		model = model with { Direction = direction };

		var result = _validator.TestValidate(model);

		result.ShouldHaveValidationErrorFor(x => x.Direction)
			  .WithErrorMessage(AppResources.InvalidDirection);
	}

	[Theory]
	[InlineData("english-US")]
	[InlineData("en-us")]
	[InlineData("EN-US")]
	[InlineData("enUS")]
	public void Invalid_LanguageFormat_Should_Fail(string language)
	{
		var model = CreateValidCommand();
		model = model with { Language = language };

		var result = _validator.TestValidate(model);

		result.ShouldHaveValidationErrorFor(x => x.Language)
			  .WithErrorMessage(AppResources.InvalidLanguageFormat);
	}

	[Theory]
	[InlineData("caption")]
	[InlineData("audio")]
	[InlineData("LiveCaption")]
	public void Invalid_MeetingTranscriptionModel_Should_Fail(string modelName)
	{
		var model = CreateValidCommand();
		model.MeetingTranscriptionModel = modelName;

		var result = _validator.TestValidate(model);

		result.ShouldHaveValidationErrorFor(x => x.MeetingTranscriptionModel)
			  .WithErrorMessage(AppResources.InvalidMeetingTranscriptionModel);
	}

	private SystemConfigCommand CreateValidCommand() => new()
	{
		OrganizationName = "My Org",
		BotName = "TestBot",
		PanelUrl = "https://panel.example.com",
		Direction = "ltr",
		Language = "en-US",
		ServiceBaseUrl = "https://service.example.com",
		BotFatherUrl = "https://botfather.example.com",
		OpenAIToken = "token123",
		HubUrl = "https://hub.example.com",
		MeetingTranscriptionModel = "liveCaption",
		AutoLeaveAllParticipantsLeft = 5,
		AutoLeaveNoParticipant = 10,
		AutoLeaveWaitingEnter = 15,
		MeetingVideoRecording = true,
		MeetingAudioRecording = true,
		MeetingTranscription = true,
		ForceUpdate = false
	};
}
