using Au5.Application.Common;
using Au5.Application.Common.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Au5.Application.Features.Meetings.CloseMeetingByUser;

public class CloseMeetingByUserCommandHandler : IRequestHandler<CloseMeetingByUserCommand, Result<bool>>
{
	private readonly IApplicationDbContext _dbContext;
	private readonly IMeetingService _meetingService;
	private readonly IBotFatherAdapter _botFather;
	private readonly ILogger<CloseMeetingByUserCommandHandler> _logger;

	public CloseMeetingByUserCommandHandler(ILogger<CloseMeetingByUserCommandHandler> logger, IApplicationDbContext dbContext, IMeetingService meetingService, IBotFatherAdapter botFather)
	{
		_meetingService = meetingService;
		_dbContext = dbContext;
		_botFather = botFather;
		_logger = logger;
	}

	public async ValueTask<Result<bool>> Handle(CloseMeetingByUserCommand request, CancellationToken cancellationToken)
	{
		var config = await _dbContext.Set<SystemConfig>().AsNoTracking().FirstOrDefaultAsync(cancellationToken);
		if (config is null)
		{
			return Error.Failure(description: AppResources.System.IsNotConfigured);
		}

		var meeting = await _dbContext.Set<Meeting>()
		.FirstOrDefaultAsync(x => x.Id == request.MeetingId && x.MeetId == request.MeetId && x.Status != MeetingStatus.Ended, cancellationToken: cancellationToken);

		if (meeting is null)
		{
			return Error.BadRequest(description: AppResources.Meeting.NotFound);
		}

		var meetingContent = await _meetingService.CloseMeeting(request.MeetId, cancellationToken);

		if (meetingContent is not null)
		{
			meeting.Status = MeetingStatus.Ended;
			meeting.Duration = meeting.CreatedAt.DiffTo(DateTime.Now).ToReadableString();
			meeting.ClosedAt = DateTime.Now;
			meeting.Entries = meetingContent.Entries; // TODO: Calculate Timeline in each entry
			meeting.Participants = meetingContent.Participants;
			meeting.Guests = meetingContent.Guests;
			meeting.ClosedMeetingUserId = request.UserId;

			var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

			if (dbResult.IsSuccess)
			{
				await _botFather.RemoveBotContainerAsync(config.BotFatherUrl, meeting.MeetId, meeting.HashToken, cancellationToken);
			}

			return dbResult.IsSuccess
				? true
				: Error.Failure(description: AppResources.Meeting.FailedToClose);
		}

		return Error.Failure(description: AppResources.Meeting.NoContent);
	}
}
