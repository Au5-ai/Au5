using Au5.Application.Features.Organizations.SetConfig;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Organizationuration;

public class OrganizationCommandValidatorTests
{
	private readonly OrganizationCommandValidator _validator;

	public OrganizationCommandValidatorTests()
	{
		_validator = new OrganizationCommandValidator();
	}

	[Fact]
	public void Valid_Command_Should_Pass()
	{
		var model = CreateValidCommand();
		var result = _validator.TestValidate(model);
		result.ShouldNotHaveAnyValidationErrors();
	}

	[Theory]
	[InlineData(nameof(OrganizationCommand.OrganizationName))]
	[InlineData(nameof(OrganizationCommand.BotName))]
	[InlineData(nameof(OrganizationCommand.Direction))]
	[InlineData(nameof(OrganizationCommand.Language))]
	public void Missing_Required_Field_Should_Fail(string propertyName)
	{
		var model = CreateValidCommand();
		typeof(OrganizationCommand).GetProperty(propertyName)!.SetValue(model, null);

		var result = _validator.TestValidate(model);

		result.ShouldHaveValidationErrorFor(propertyName)
			  .WithErrorMessage(AppResources.Validation.Required);
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
			  .WithErrorMessage(AppResources.Validation.InvalidDirection);
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
			  .WithErrorMessage(AppResources.Validation.InvalidLanguageFormat);
	}

	private OrganizationCommand CreateValidCommand() => new()
	{
		OrganizationName = "My Org",
		BotName = "TestBot",
		Direction = "ltr",
		Language = "en-US",
	};
}
