using Au5.Application.Common.Resources;

namespace Au5.Application.Features.ConfigCompany.Init;

public class InitCompanyCommandValiadtor : AbstractValidator<InitCompanyCommand>
{
	public InitCompanyCommandValiadtor()
	{
		RuleFor(x => x.Name)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.WithErrorCode(nameof(AppResources.Required));

		RuleFor(x => x.BotName)
		   .NotEmpty()
		   .WithMessage(AppResources.Required)
		   .WithErrorCode(nameof(AppResources.Required));

		RuleFor(x => x.PanelUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.WithErrorCode(nameof(AppResources.Required))
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Invalid_Url)
			.WithErrorCode(nameof(AppResources.Invalid_Url));

		RuleFor(x => x.Direction)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.WithErrorCode(nameof(AppResources.Required))
			.Must(dir => dir is "ltr" or "rtl")
			.WithMessage(AppResources.Invalid_Direction)
			.WithErrorCode(nameof(AppResources.Invalid_Direction));

		RuleFor(x => x.Language)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.WithErrorCode(nameof(AppResources.Required))
			.Matches("^[a-z]{2}-[A-Z]{2}$")
			.WithMessage(AppResources.Invalid_Language_Format)
			.WithErrorCode(nameof(AppResources.Invalid_Language_Format));

		RuleFor(x => x.ServiceBaseUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.WithErrorCode(nameof(AppResources.Required))
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Invalid_Url)
			.WithErrorCode(nameof(AppResources.Invalid_Url));

		RuleFor(x => x.HubUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.WithErrorCode(nameof(AppResources.Required))
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Invalid_Url)
			.WithErrorCode(nameof(AppResources.Invalid_Url));
	}
}
