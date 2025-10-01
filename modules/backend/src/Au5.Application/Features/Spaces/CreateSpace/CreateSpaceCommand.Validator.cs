using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandValidator : AbstractValidator<CreateSpaceCommand>
{
	public CreateSpaceCommandValidator()
	{
		RuleFor(x => x.Name)
			.NotEmpty()
			.WithMessage(AppResources.Space.NameRequired)
			.MaximumLength(100)
			.WithMessage(AppResources.Space.NameMaxLength);

		RuleFor(x => x.Description)
			.MaximumLength(500)
			.WithMessage(AppResources.Space.DescriptionMaxLength)
			.When(x => !string.IsNullOrEmpty(x.Description));

		RuleFor(x => x.UserIds)
			.NotNull()
			.WithMessage(AppResources.Validation.Required)
			.Must(userIds => userIds != null && userIds.All(id => id != Guid.Empty))
			.WithMessage(AppResources.Space.InvalidUserIds);
	}
}
