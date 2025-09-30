namespace Au5.Application.Features.Spaces.CreateSpace;

public class CreateSpaceCommandValidator : AbstractValidator<CreateSpaceCommand>
{
	public CreateSpaceCommandValidator()
	{
		RuleFor(x => x.Name)
			.NotEmpty()
			.WithMessage("Space name is required")
			.MaximumLength(100)
			.WithMessage("Space name must not exceed 100 characters");

		RuleFor(x => x.Description)
			.MaximumLength(500)
			.WithMessage("Description must not exceed 500 characters")
			.When(x => !string.IsNullOrEmpty(x.Description));
	}
}
