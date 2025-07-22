using Au5.Application.Common.Abstractions;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result<Guid>>
{
	private readonly IApplicationDbContext _dbContext;

	public AddBotCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<Guid>> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = Guid.NewGuid();
		_dbContext.Set<Meeting>().Add(new Meeting()
		{
			Id = meetingId,
			MeetId = request.MeetId,
			BotName = request.BotName,
			IsBotAdded = false,
			BotInviterUserId = Guid.Empty, // get from jwt
			CreatedAt = DateTime.UtcNow,
			Platform = request.Platform,
			Status = MeetingStatus.NotStarted,
		});

		_ = await _dbContext.SaveChangesAsync(cancellationToken); // Check db result

		return meetingId;
	}
}
