using Au5.Application.Common.Resources;

namespace Au5.Application.Features.SystemConfigs.SetConfig;

public class SystemConfigCommandValidator : AbstractValidator<SystemConfigCommand>
{
	public SystemConfigCommandValidator()
	{
		RuleFor(x => x.OrganizationName)
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

		RuleFor(x => x.BotFatherUrl)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var temp) &&
						 (temp.Scheme == Uri.UriSchemeHttp || temp.Scheme == Uri.UriSchemeHttps))
			.WithMessage(AppResources.InvalidUrl);

		RuleFor(x => x.BotHubUrl)
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

		RuleFor(x => x.MeetingTranscriptionModel)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(dir => dir is "liveCaption" or "liveAudio")
			.WithMessage(AppResources.InvalidMeetingTranscriptionModel);

		RuleFor(x => x.AutoLeaveNoParticipant)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(value => value > 0)
			.WithMessage(AppResources.MustBeMoreThanZero);

		RuleFor(x => x.AutoLeaveAllParticipantsLeft)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(value => value > 0)
			.WithMessage(AppResources.MustBeMoreThanZero);

		RuleFor(x => x.AutoLeaveWaitingEnter)
			.NotEmpty()
			.WithMessage(AppResources.Required)
			.Must(value => value > 0)
			.WithMessage(AppResources.MustBeMoreThanZero);
	}
}
