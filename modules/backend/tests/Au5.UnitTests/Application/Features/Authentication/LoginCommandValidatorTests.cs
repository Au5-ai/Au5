using Au5.Application.Features.Authentication;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Authentication;
public class LoginCommandValidatorTests
{
	private readonly LoginCommandValidator _validator = new();

	[Fact]
	public void Should_HaveError_When_UsernameIsEmpty()
	{
		var command = new LoginCommand(Username: string.Empty, Password: "validPass123");
		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.Username)
			.WithErrorMessage(AppResources.Required);
	}

	[Fact]
	public void ShouldHaveError_When_UsernameIsNotEmail()
	{
		var command = new LoginCommand(Username: "username", Password: "validPass123");
		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.Username)
			.WithErrorMessage(AppResources.InvalidUsernameFormat);
	}

	[Fact]
	public void Should_HaveError_When_PasswordIsEmpty()
	{
		var command = new LoginCommand(Username: string.Empty, Password: string.Empty);
		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.Password)
			.WithErrorMessage(AppResources.Required);
	}

	[Fact]
	public void Should_HaveError_When_PasswordIsTooShort()
	{
		var command = new LoginCommand(Username: string.Empty, Password: "123");
		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.Password)
			.WithErrorMessage(AppResources.InvalidPasswordFormat);
	}

	[Fact]
	public void Should_NotHaveError_When_ValidIsCommand()
	{
		var command = new LoginCommand(Username: "mha.karimi@gmail.com", Password: "validPass123");
		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}
}
