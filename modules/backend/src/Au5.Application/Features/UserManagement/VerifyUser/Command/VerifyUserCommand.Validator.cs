namespace Au5.Application.Features.UserManagement.VerifyUser.Command;

public class VerifyUserCommandValidator : AbstractValidator<VerifyUserCommand>
{
	public VerifyUserCommandValidator()
	{
		RuleFor(x => x.FullName)
			.MaximumLength(50).WithMessage("MaxLength is 50")
			.NotEmpty().WithMessage("Full name is required.");

		RuleFor(x => x.Password)
			.NotEmpty().WithMessage("Password is required.")
			.MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
			.Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
			.Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
			.Matches(@"\d").WithMessage("Password must contain at least one number.")
			.Matches(@"[\W_]").WithMessage("Password must contain at least one special character.");

		RuleFor(x => x.RepeatedPassword)
			.NotEmpty().WithMessage("Repeated password is required.")
			.Equal(x => x.Password).WithMessage("Passwords do not match.");
	}
}
