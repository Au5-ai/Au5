namespace Au5.Application.Features.Meetings.DeleteEntry;

public class DeleteEntryCommandValidator : AbstractValidator<DeleteEntryCommand>
{
	public DeleteEntryCommandValidator()
	{
		RuleFor(x => x.MeetingId)
			.NotEmpty()
			.WithMessage("Meeting ID is required.");

		RuleFor(x => x.EntryId)
			.GreaterThan(0)
			.WithMessage("Entry ID must be greater than zero.");
	}
}