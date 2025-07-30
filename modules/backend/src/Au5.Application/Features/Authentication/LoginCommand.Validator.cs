using Au5.Application.Common.Resources;

namespace Au5.Application.Features.Authentication;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
	public LoginCommandValidator()
	{
		RuleFor(x => x.Username)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.EmailAddress()
			.WithMessage(AppResources.InvalidUsernameFormat);

		RuleFor(x => x.Password)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.MinimumLength(6)
			.WithMessage(AppResources.InvalidPasswordFormat);
	}
}
