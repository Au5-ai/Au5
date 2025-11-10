namespace Au5.Application.Features.Meetings.Export;

public class ExportQueryValidator : AbstractValidator<ExportQuery>
{
	public ExportQueryValidator()
	{
		RuleFor(x => x.MeetingId)
			.NotEmpty()
			.WithMessage("Meeting ID is required.");

		RuleFor(x => x.Format)
			.NotEmpty()
			.WithMessage("Format is required.")
			.Must(format => string.Equals(format, "text", StringComparison.OrdinalIgnoreCase))
			.WithMessage("Only 'text' format is currently supported.");
	}
}
