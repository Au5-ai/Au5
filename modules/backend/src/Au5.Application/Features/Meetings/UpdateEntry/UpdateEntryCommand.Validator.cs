namespace Au5.Application.Features.Meetings.UpdateEntry;

public class UpdateEntryCommandValidator : AbstractValidator<UpdateEntryCommand>
{
	public UpdateEntryCommandValidator()
	{
		RuleFor(x => x.MeetingId)
			.NotEmpty()
			.WithMessage("Meeting ID is required.");

		RuleFor(x => x.EntryId)
			.GreaterThan(0)
			.WithMessage("Entry ID must be greater than zero.");

		RuleFor(x => x.Content)
			.NotEmpty()
			.WithMessage("Content cannot be empty.")
			.MaximumLength(5000)
			.WithMessage("Content cannot exceed 5000 characters.");
	}
}
