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

		RuleFor(x => x.Users)
			.NotNull()
			.WithMessage(AppResources.Validation.Required)
			.Must(users => users != null && users.All(user => user.UserId != Guid.Empty))
			.WithMessage(AppResources.Space.InvalidUserIds);
	}
}
