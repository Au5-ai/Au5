using Au5.Application.Common;

namespace Au5.Application.Features.SystemConfigs.SetConfig;

public class SystemConfigCommandValidator : AbstractValidator<SystemConfigCommand>
{
	public SystemConfigCommandValidator()
	{
		RuleFor(x => x.OrganizationName)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.BotName)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.PanelUrl)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Validation.InvalidUrl);

		RuleFor(x => x.Direction)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(dir => dir is "ltr" or "rtl")
			.WithMessage(AppResources.Validation.InvalidDirection);

		RuleFor(x => x.Language)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Matches("^[a-z]{2}-[A-Z]{2}$")
			.WithMessage(AppResources.Validation.InvalidLanguageFormat);

		RuleFor(x => x.ServiceBaseUrl)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Validation.InvalidUrl);

		RuleFor(x => x.BotFatherUrl)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Validation.InvalidUrl);

		RuleFor(x => x.BotHubUrl)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Validation.InvalidUrl);

		RuleFor(x => x.OpenAIToken)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.OpenAIProxyUrl)
			.Must(url => string.IsNullOrEmpty(url) ||
				(Uri.TryCreate(url, UriKind.Absolute, out var temp) &&
				 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps)))
			.WithMessage(AppResources.Validation.InvalidUrl);

		RuleFor(x => x.HubUrl)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.Validation.InvalidUrl);

		RuleFor(x => x.MeetingTranscriptionModel)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(dir => dir is "liveCaption" or "liveAudio")
			.WithMessage(AppResources.Validation.InvalidMeetingTranscriptionModel);

		RuleFor(x => x.AutoLeaveNoParticipant)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(value => value > 0)
			.WithMessage(AppResources.Validation.MustBeMoreThanZero);

		RuleFor(x => x.AutoLeaveAllParticipantsLeft)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(value => value > 0)
			.WithMessage(AppResources.Validation.MustBeMoreThanZero);

		RuleFor(x => x.AutoLeaveWaitingEnter)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required)
			.Must(value => value > 0)
			.WithMessage(AppResources.Validation.MustBeMoreThanZero);
	}
}
