using Au5.Application.Common;

namespace Au5.Application.Features.Spaces.RemoveMemberFromSpace;

public class RemoveMemberFromSpaceCommandValidator : AbstractValidator<RemoveMemberFromSpaceCommand>
{
	public RemoveMemberFromSpaceCommandValidator()
	{
		RuleFor(x => x.SpaceId)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.MemberUserId)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);
	}
}
