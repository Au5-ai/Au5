using Au5.Application.Common;

namespace Au5.Application.Features.Organizations.SetConfig;

public class OrganizationCommandValidator : AbstractValidator<OrganizationCommand>
{
	public OrganizationCommandValidator()
	{
		RuleFor(x => x.OrganizationName)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.BotName)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);

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
	}
}
