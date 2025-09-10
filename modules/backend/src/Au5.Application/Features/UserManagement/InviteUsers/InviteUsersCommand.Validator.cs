namespace Au5.Application.Features.UserManagement.InviteUsers;

public class InviteUsersCommandValidator : AbstractValidator<InviteUsersCommand>
{
	public InviteUsersCommandValidator()
	{
		RuleFor(x => x.Invites)
			.NotNull().WithMessage("Invites list is required.")
			.NotEmpty().WithMessage("At least one invite must be provided.");

		RuleForEach(x => x.Invites)
			.SetValidator(new InviteUsersRequestValidator());
	}
}

public class InviteUsersRequestValidator : AbstractValidator<InviteUsersRequest>
{
	public InviteUsersRequestValidator()
	{
		RuleFor(x => x.Email)
			.NotEmpty().WithMessage("Email is required.")
			.EmailAddress().WithMessage("Invalid email format.");

		RuleFor(x => x.Role)
			.NotEmpty().WithMessage("Role is required.");
	}
}
