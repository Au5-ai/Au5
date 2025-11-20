using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.PublicUrl;

public class PublicMeetingUrlCommandValidator : AbstractValidator<PublicMeetingUrlCommand>
{
	public PublicMeetingUrlCommandValidator()
	{
		RuleFor(s => s.MeetingId)
			.NotEmpty()
			.WithMessage(AppResources.Validation.Required);
		RuleFor(s => s.ExpirationDays)
			.NotNull()
			.Must(s => s is 30 or 60 or 90)
			.WithMessage("ExpirationDays must be one of the following values: 30, 60, or 90.");
	}
}
