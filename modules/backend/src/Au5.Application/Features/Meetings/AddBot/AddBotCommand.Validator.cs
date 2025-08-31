using Au5.Application.Common;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandValiadtor : AbstractValidator<AddBotCommand>
{
	public AddBotCommandValiadtor()
	{
		RuleFor(x => x.BotName)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.MeetId)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);

		RuleFor(x => x.Platform)
		   .NotEmpty()
		   .WithMessage(AppResources.Validation.Required);
	}
}
