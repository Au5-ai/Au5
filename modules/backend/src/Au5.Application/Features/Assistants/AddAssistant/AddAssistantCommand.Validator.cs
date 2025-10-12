using Au5.Application.Common;

namespace Au5.Application.Features.Assistants.AddAssistant;
public class AddAssistantCommandValidator : AbstractValidator<AddAssistantCommand>
{
	public AddAssistantCommandValidator()
	{
		RuleFor(x => x.Name)
			.NotEmpty().WithMessage(AppResources.Validation.AssistantNameRequired)
			.MaximumLength(200).WithMessage(AppResources.Validation.AssistantNameMaxLength);

		RuleFor(x => x.Icon)
			.MaximumLength(200).WithMessage(AppResources.Validation.AssistantIconMaxLength);

		RuleFor(x => x.Description)
			.MaximumLength(500).WithMessage(AppResources.Validation.AssistantDescriptionMaxLength);

		RuleFor(x => x.Instructions)
			.NotEmpty().WithMessage(AppResources.Validation.AssistantInstructionsRequired)
			.MaximumLength(2000).WithMessage(AppResources.Validation.AssistantInstructionsMaxLength);

		RuleFor(x => x.LLMModel)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);
	}
}
