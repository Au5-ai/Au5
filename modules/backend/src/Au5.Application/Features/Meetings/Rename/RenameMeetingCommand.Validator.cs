namespace Au5.Application.Features.Meetings.Rename;

public class RenameMeetingCommandValidator : AbstractValidator<RenameMeetingCommand>
{
	public RenameMeetingCommandValidator()
	{
		RuleFor(s => s.meetingId).NotEmpty().NotNull();
		RuleFor(s => s.newTitle).NotEmpty().NotNull();
	}
}
