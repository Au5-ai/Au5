using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.Rename;

public class RenameMeetingCommandValidator : AbstractValidator<RenameMeetingCommand>
{
	public RenameMeetingCommandValidator()
	{
		RuleFor(s => s.MeetingId)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);
		RuleFor(s => s.NewTitle)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);
	}
}
