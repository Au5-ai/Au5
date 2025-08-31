using Au5.Application.Common;

namespace Au5.Application.Features.Authentication;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
	public LoginCommandValidator()
	{
		RuleFor(x => x.Username)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.EmailAddress()
			.WithMessage(AppResources.Validation.InvalidUsernameFormat);

		RuleFor(x => x.Password)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.MinimumLength(6)
			.WithMessage(AppResources.Validation.InvalidPasswordFormat);
	}
}
