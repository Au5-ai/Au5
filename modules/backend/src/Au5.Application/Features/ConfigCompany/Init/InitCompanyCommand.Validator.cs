using Au5.Application.Common.Resources;

namespace Au5.Application.Features.ConfigCompany.Init;

public class InitCompanyCommandValiadtor : AbstractValidator<InitCompanyCommand>
{
	public InitCompanyCommandValiadtor()
	{
		RuleFor(x => x.Name)
			.NotEmpty()
			.WithMessage(AppResources.NotBeEmpty)
			.WithErrorCode(nameof(AppResources.NotBeEmpty));

		RuleFor(x => x.BotName)
		   .NotEmpty()
		   .WithMessage(AppResources.NotBeEmpty)
		   .WithErrorCode(nameof(AppResources.NotBeEmpty));

		RuleFor(x => x.PanelUrl)
			.NotEmpty()
			.WithMessage(AppResources.NotBeEmpty)
			.WithErrorCode(nameof(AppResources.NotBeEmpty))
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl)
			.WithErrorCode(nameof(AppResources.InvalidUrl));

		RuleFor(x => x.Direction)
			.NotEmpty()
			.WithMessage(AppResources.NotBeEmpty)
			.WithErrorCode(nameof(AppResources.NotBeEmpty))
			.Must(dir => dir is "ltr" or "rtl")
			.WithMessage(AppResources.InvalidDirection)
			.WithErrorCode(nameof(AppResources.InvalidDirection));

		RuleFor(x => x.Language)
			.NotEmpty()
			.WithMessage(AppResources.NotBeEmpty)
			.WithErrorCode(nameof(AppResources.NotBeEmpty))
			.Matches("^[a-z]{2}-[A-Z]{2}$")
			.WithMessage(AppResources.InvalidLanguageFormat)
			.WithErrorCode(nameof(AppResources.InvalidLanguageFormat));

		RuleFor(x => x.ServiceBaseUrl)
			.NotEmpty()
			.WithMessage(AppResources.NotBeEmpty)
			.WithErrorCode(nameof(AppResources.NotBeEmpty))
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl)
			.WithErrorCode(nameof(AppResources.InvalidUrl));

		RuleFor(x => x.HubUrl)
			.NotEmpty()
			.WithMessage(AppResources.NotBeEmpty)
			.WithErrorCode(nameof(AppResources.NotBeEmpty))
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl)
			.WithErrorCode(nameof(AppResources.InvalidUrl));
	}
}
