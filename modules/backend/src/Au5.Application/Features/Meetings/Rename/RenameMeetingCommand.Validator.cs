using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.Rename;

public class RenameMeetingCommandValidator : AbstractValidator<RenameMeetingCommand>
{
	public RenameMeetingCommandValidator()
	{
		RuleFor(s => s.meetingId)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);
		RuleFor(s => s.newTitle)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);
	}
}
