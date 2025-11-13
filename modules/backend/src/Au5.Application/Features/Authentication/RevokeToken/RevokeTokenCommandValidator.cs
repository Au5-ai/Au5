using Au5.Application.Common;

namespace Au5.Application.Features.Authentication.RevokeToken;

public class RevokeTokenCommandValidator : AbstractValidator<RevokeTokenCommand>
{
	public RevokeTokenCommandValidator()
	{
		RuleFor(x => x.RefreshToken)
			.NotEmpty()
			.WithMessage(AppResources.Auth.RefreshTokenRequired);
	}
}
