using Au5.Application.Common;

namespace Au5.Application.Features.Authentication.RefreshToken;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
	public RefreshTokenCommandValidator()
	{
		RuleFor(x => x.RefreshToken)
			.NotEmpty()
			.WithMessage(AppResources.Auth.RefreshTokenRequired);
	}
}
