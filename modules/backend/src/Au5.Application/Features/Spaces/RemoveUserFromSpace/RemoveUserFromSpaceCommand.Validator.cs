using FluentValidation;

namespace Au5.Application.Features.Spaces.RemoveUserFromSpace;

public class RemoveUserFromSpaceCommandValidator : AbstractValidator<RemoveUserFromSpaceCommand>
{
	public RemoveUserFromSpaceCommandValidator()
	{
		RuleFor(x => x.SpaceId)
			.NotEmpty()
			.WithMessage("SpaceId is required.");

		RuleFor(x => x.UserId)
			.NotEmpty()
			.WithMessage("UserId is required.");
	}
}
