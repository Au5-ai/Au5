namespace Au5.Application.Features.Spaces.AddMembersToSpace;

public class AddMembersToSpaceCommandValidator : AbstractValidator<AddMembersToSpaceCommand>
{
	public AddMembersToSpaceCommandValidator()
	{
		RuleFor(x => x.SpaceId)
			.NotEmpty()
			.WithMessage("SpaceId is required.");

		RuleFor(x => x.Users)
			.NotEmpty()
			.WithMessage("At least one user is required.");

		RuleForEach(x => x.Users)
			.ChildRules(user =>
			{
				user.RuleFor(u => u.UserId)
					.NotEmpty()
					.WithMessage("UserId is required.");
			});
	}
}
