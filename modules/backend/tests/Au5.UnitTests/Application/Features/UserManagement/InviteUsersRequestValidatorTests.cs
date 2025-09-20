using Au5.Application.Features.UserManagement.InviteUsers;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.UserManagement;

public class InviteUsersRequestValidatorTests
{
	private readonly InviteUsersRequestValidator _validator = new();

	[Fact]
	public void Should_HaveError_When_EmailIsEmpty()
	{
		var request = new InviteUsersRequest { Email = string.Empty, Role = RoleTypes.User };

		var result = _validator.TestValidate(request);

		result.ShouldHaveValidationErrorFor(r => r.Email)
			  .WithErrorMessage("Email is required.");
	}

	[Fact]
	public void Should_HaveError_When_EmailIsInvalid()
	{
		var request = new InviteUsersRequest { Email = "invalid-email", Role = RoleTypes.User };

		var result = _validator.TestValidate(request);

		result.ShouldHaveValidationErrorFor(r => r.Email)
			  .WithErrorMessage("Invalid email format.");
	}

	[Fact]
	public void Should_HaveError_When_RoleIsEmpty()
	{
		var request = new InviteUsersRequest { Email = "valid@example.com", Role = default };

		var result = _validator.TestValidate(request);

		result.ShouldHaveValidationErrorFor(r => r.Role)
			  .WithErrorMessage("Role is required.");
	}

	[Fact]
	public void Should_Pass_When_RequestIsValid()
	{
		var request = new InviteUsersRequest { Email = "valid@example.com", Role = RoleTypes.Admin };

		var result = _validator.TestValidate(request);

		result.ShouldNotHaveAnyValidationErrors();
	}
}
