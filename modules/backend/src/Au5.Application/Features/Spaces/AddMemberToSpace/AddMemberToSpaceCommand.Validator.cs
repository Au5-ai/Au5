using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.AddMemberToSpace;

public class AddMemberToSpaceCommandValidator : AbstractValidator<AddMemberToSpaceCommand>
{
	public AddMemberToSpaceCommandValidator()
	{
		RuleFor(x => x.SpaceId)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.NewMemberUserId)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);
	}
}
