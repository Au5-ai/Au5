using Au5.Application.Common.Resources;

namespace Au5.Application.Features.Org.Config;

public class ConfigOrganizationCommandValiadtor : AbstractValidator<ConfigOrganizationCommand>
{
	public ConfigOrganizationCommandValiadtor()
	{
		RuleFor(x => x.Name)
			.NotEmpty()
			.WithMessage(AppResources.Required);

		RuleFor(x => x.BotName)
		   .NotEmpty()
		   .WithMessage(AppResources.Required);

		RuleFor(x => x.PanelUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl);

		RuleFor(x => x.Direction)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(dir => dir is "ltr" or "rtl")
			.WithMessage(AppResources.InvalidDirection);

		RuleFor(x => x.Language)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Matches("^[a-z]{2}-[A-Z]{2}$")
			.WithMessage(AppResources.InvalidLanguageFormat);

		RuleFor(x => x.ServiceBaseUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl);

		RuleFor(x => x.OpenAIToken)
			.NotEmpty()
			.WithMessage(AppResources.Required);

		RuleFor(x => x.HubUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl);
	}
}
