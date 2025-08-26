using Au5.Application.Features.Administration.AddAdmin;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Authentication.AddAdmin;

public class AddAdminCommandValidatorTests
{
	private readonly AddAdminCommandValidator _validator;

	public AddAdminCommandValidatorTests()
	{
		_validator = new AddAdminCommandValidator();
	}

	[Fact]
	public void Should_Pass_When_CommandIsValid()
	{
		var command = new AddAdminCommand(
			Email: "valid.user@test.com",
			FullName: "Valid User",
			Password: "StrongP@ss1",
			RepeatedPassword: "StrongP@ss1");

		var result = _validator.TestValidate(command);

		Assert.True(result.IsValid);
	}

	[Fact]
	public void Should_Fail_When_FullNameIsEmpty()
	{
		var command = new AddAdminCommand(
			Email: "valid@test.com",
			FullName: string.Empty,
			Password: "StrongP@ss1",
			RepeatedPassword: "StrongP@ss1");

		var result = _validator.TestValidate(command);

		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "FullName");
	}

	[Fact]
	public void Should_Fail_When_EmailIsInvalid()
	{
		var command = new AddAdminCommand(
			Email: "not-an-email",
			FullName: "Test User",
			Password: "StrongP@ss1",
			RepeatedPassword: "StrongP@ss1");

		var result = _validator.TestValidate(command);

		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Email");
	}

	[Theory]
	[InlineData("short1!", "Password must be at least 8 characters long.")]
	[InlineData("alllowercase1!", "Password must contain at least one uppercase letter.")]
	[InlineData("ALLUPPERCASE1!", "Password must contain at least one lowercase letter.")]
	[InlineData("NoDigits!", "Password must contain at least one number.")]
	[InlineData("NoSpecial1", "Password must contain at least one special character.")]
	public void Should_Fail_When_PasswordDoesNotMeetComplexity(string password, string expectedMessage)
	{
		var command = new AddAdminCommand(
			Email: "valid@test.com",
			FullName: "Test User",
			Password: password,
			RepeatedPassword: password);

		var result = _validator.TestValidate(command);

		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.ErrorMessage == expectedMessage);
	}

	[Fact]
	public void Should_Fail_When_RepeatedPasswordDoesNotMatch()
	{
		var command = new AddAdminCommand(
			Email: "valid@test.com",
			FullName: "Test User",
			Password: "StrongP@ss1",
			RepeatedPassword: "Mismatch1!");

		var result = _validator.TestValidate(command);

		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "RepeatedPassword");
	}
}
