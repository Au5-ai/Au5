using Au5.Application.Features.UserManagement.InviteUsers;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.UserManagement;

public class InviteUsersCommandValidatorTests
{
	private readonly InviteUsersCommandValidator _validator = new();

	[Fact]
	public void Should_HaveError_When_InvitesIsNull()
	{
		var command = new InviteUsersCommand(null);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(c => c.Invites)
			  .WithErrorMessage("Invites list is required.");
	}

	[Fact]
	public void Should_HaveError_When_InvitesIsEmpty()
	{
		var command = new InviteUsersCommand([]);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(c => c.Invites)
			  .WithErrorMessage("At least one invite must be provided.");
	}

	[Fact]
	public void Should_Pass_When_ValidInvitesProvided()
	{
		var command = new InviteUsersCommand(
		[
			new() { Email = "valid@example.com", Role = RoleTypes.User }
		]);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}
}
