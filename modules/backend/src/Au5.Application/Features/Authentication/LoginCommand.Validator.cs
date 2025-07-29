namespace Au5.Application.Features.Authentication;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
	public LoginCommandValidator()
	{
		RuleFor(x => x.Username)
			.NotEmpty()
			.WithMessage("Username is required.")
			.EmailAddress()
			.WithMessage("Invalid Username format.");

		RuleFor(x => x.Password)
			.NotEmpty()
			.WithMessage("Password is required.")
			.MinimumLength(6)
			.WithMessage("Password must be at least 6 characters long.");
	}
}
